const { Client } = require("@elastic/elasticsearch");
require("dotenv").config();

const client = new Client({
  node: process.env.ELASTIC_URL, // Your Elasticsearch server URL
});

const settings = {
  analysis: {
    filter: {
      autocomplete_filter: {
        type: "edge_ngram",
        min_gram: 1,
        max_gram: 20,
      },
    },
    tokenizer: {
      autocomplete_tokenizer: {
        type: "edge_ngram",
        min_gram: 1,
        max_gram: 20,
        token_chars: ["letter", "digit", "punctuation", "symbol"],
      },
    },
    analyzer: {
      autocomplete: {
        type: "custom",
        tokenizer: "autocomplete_tokenizer",
        filter: ["lowercase", "autocomplete_filter"],
      },
      keyword_lowercase: {
        type: "custom",
        tokenizer: "keyword",
        filter: ["lowercase"],
      },
    },
  },
  number_of_shards: 1,
  number_of_replicas: 1,
};

const mappings = {
  properties: {
    id: { type: "keyword" },
    name: {
      type: "text",
      analyzer: "autocomplete",
      search_analyzer: "keyword_lowercase",
    },
    email: {
      type: "text",
      analyzer: "autocomplete",
      search_analyzer: "keyword_lowercase",
    },
    imageName: { type: "keyword" },
    isDeleted: { type: "boolean" },
  },
};

async function createIndex(indexName) {
  return client.indices.create({
    index: indexName,
    body: {
      settings: settings,
      mappings: mappings,
    },
  });
}

async function indexExists(indexName) {
  try {
    const response = await client.indices.exists({
      index: indexName,
    });
    return { ok: true };
  } catch (error) {
    console.log("Error in checking index exists ", error);
    return { ok: false, error: "Error in checking index exists" };
  }
}

async function addElastic(indexName, document, id) {
  try {
    const response = await client.index({
      index: indexName,
      id: id,
      body: document,
    });
    console.log("Document added:", response.body);
    return response.body;
  } catch (error) {
    console.error("Error adding document:", error);
    throw error;
  }
}

async function updateElastic(indexName, documentId) {
  try {
    const response = await client.update({
      index: indexName,
      id: documentId,
      body: {
        doc: { isDeleted: true },
      },
    });
    console.log("Document updated:", response.body);
    return response.body;
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
}

async function searchElastic(indexName, q, skipValue) {
  try {
    const response = await client.search({
      index: indexName,
      body: {
        from: skipValue,
        size: 8,
        query: {
          bool: {
            must: q ? [] : { match_all: {} },
            should: q
              ? [
                  { match: { name: { query: q, operator: "and" } } },
                  { match: { email: { query: q, operator: "and" } } },
                  { wildcard: { name: `*${q}*` } },
                  { wildcard: { email: `*${q}*` } },
                ]
              : undefined,
            minimum_should_match: q ? 1 : undefined,
            filter: [{ term: { isDeleted: false } }],
          },
        },
      },
    });

    console.log("Elasticsearch response:", JSON.stringify(response.hits.hits, null, 2)); // Log the entire response

    // Simplified check for valid response structure
    if (response.hits.hits) {
      const hitsArray = response.hits.hits;
      return {
        ok: true,
        data: {
          foundusers: hitsArray,
          total: response.hits.total.value,
        },
      };
    } else {
      // console.error(
      //   "Unexpected Elasticsearch response structure",
      //   JSON.stringify(response, null, 2)
      // ); // Log unexpected structure
      return { ok: false, error: "Error in searching documents in elastic" };
    }
  } catch (error) {
    console.error("Error in searching documents in elastic:", error); // Detailed error logging
    return {
      ok: false,
      error: "Error in catch searching documents in elastic",
    };
  }
}

module.exports = {
  createIndex,
  indexExists,
  addElastic,
  updateElastic,
  searchElastic,
};
