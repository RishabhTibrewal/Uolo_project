const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const users = require("./models/model");
const mongoose = require("mongoose");
const {
  indexExists,
  createIndex,
  addElastic,
  updateElastic,
  searchElastic,
} = require("./utils/elasticSearch");

const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const crypto = require("crypto");
const sharp = require("sharp");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require("dotenv").config();
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Successfully connected to Database...");
  })
  .catch((err) => {
    console.log("Error while connecting to Database ", err);
  });

const bucketName = process.env.NAME;
const region = process.env.REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_KEY;

const s3Client = new S3Client({
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  region: region,
});

const RandomImageName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

const app = express();
const port = 8080;

app.use(express.json());
app.use("/uploads", express.static("uploads"));

// CORS options to allow requests from frontend running on port 5500
const corsOptions = {
  origin: "http://localhost:3000", // Allow only requests from this origin
  methods: "GET,POST,DELETE", // Allow only these methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow only these headers
};

// Use CORS middleware with specified options
app.use(cors(corsOptions));

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const indexName = "my_index";

app.get("/users", async (req, res) => {
  try {
    const searchTerm = req.query.query; // Accessing the query parameter
    console.log(`Received search term: ${searchTerm}`);
    // const allUsers = await users.find({});
    const skipValue = (1 - 1) * 8;
    // Use Elasticsearch to search for users based on the query
    const result = await searchElastic(indexName, searchTerm, skipValue);
    console.log("Search result:", result); // Log the result
    if (result.ok) {
      // Extract found users and total count from Elasticsearch response
      let foundUsers = result.data.foundusers.map((hit) => ({
        _id: hit._id,
        ...hit._source,
      }));
      const total = result.data.total;
      console.log(foundUsers);
      console.log(total);

      const usersWithUrls = await Promise.all(
        foundUsers.map(async (user) => {
          if (user.imageName) {
            const getObjectParams = {
              Bucket: bucketName,
              Key: user.imageName,
            };
            const command = new GetObjectCommand(getObjectParams);
            const url = await getSignedUrl(s3Client, command, {
              expiresIn: 3600,
            });

            console.log(`URL for ${user.Name}: ${url}`);
            return { ...user, imageUrl: url };
          }
          return user;
        })
      );
      // res.status(200).json(usersWithUrls);

      console.log("Final usersWithUrls:", usersWithUrls); // Log final users with URLs
      res.json(usersWithUrls);
    } else {
      console.error("Elasticsearch search error:", result.error); // Log the error message
      res.status(500).json({ ok: false, error: result.error });
    }
  } catch (error) {
    console.error("Error fetching users:", error); // Detailed error logging
    res.status(500).json({ error: "Internal server error" });
  }
});

// const allUsers = await searchElastic(indexName, searchTerm);
//     console.log(allUsers);
//     console.log(allUsers.data);

//     const usersWithUrls = await Promise.all(
//       allUsers.data.map(async (user) => {
//         if (user.imageName) {
//           const getObjectParams = {
//             Bucket: bucketName,
//             Key: user.imageName,
//           };
//           const command = new GetObjectCommand(getObjectParams);
//           const url = await getSignedUrl(s3Client, command, {
//             expiresIn: 3600,
//           });

//           console.log(`URL for ${user.Name}: ${url}`);
//           return { ...user.toObject(), imageUrl: url };
//         }
//         return user.toObject();
//       })
//     );
//     res.status(200).json(usersWithUrls);

app.post("/users", upload.single("image"), async (req, res) => {
  const { name, email, password } = req.body;
  const image = req.file ? `/uploads/${req.file.filename}` : null;
  console.log("req.file", req.file);
  // req.file.buffer;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required" });
  }

  const imageBuffer = await sharp(req.file.buffer)
    .resize({ height: 1920, width: 1080, fit: "contain" })
    .toBuffer();

  const imageName = RandomImageName();
  const uploadParams = {
    Bucket: bucketName,
    Body: imageBuffer,
    Key: imageName,
    ContentType: req.file.mimetype,
  };

  // Send the upload to S3
  await s3Client.send(new PutObjectCommand(uploadParams));

  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    image,
  };

  const result = await users.create({
    name: name,
    email: email,
    password: password,
    imageName: imageName,
  });
  console.log(result._id.toString());

  // add user to elasticsearch
  await addElastic(
    indexName,
    {
      name: result.name,
      email: result.email,
      password: result.password,
      imageName: result.imageName,
      isDeleted: result.isDeleted,
    },
    result._id.toString()
  );

  console.log(result);
  return res.status(201).json(result);
});

app
  .route("/users/:id")
  .get(async (req, res) => {
    const userId = req.params.id;
    const user = await users.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  })
  .delete(async (req, res) => {
    const userId = req.params.id;

    if (userId === -1) {
      return res.status(404).json({ error: "User not found" });
    }
    const user = await users.findById(userId);
    // console.log(users, userId);
    await users.updateOne({ _id: userId }, { isDeleted: true }); // update the DB

    await updateElastic(indexName, userId.toString()); // update the elastic

    res.status(200).json(users);
  });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);

  // Create elastic search index if it doesnt exists
  try {
    const response = await indexExists(indexName);
    // console.log(response);
    if (!response.body) {
      await createIndex(indexName);
      console.log(`Index "${indexName}" created.`);
    } else {
      console.log(`Index "${indexName}" already exists.`);
    }
  } catch (error) {
    console.error(`Error checking/creating index: ${error.message}`);
  }
});
