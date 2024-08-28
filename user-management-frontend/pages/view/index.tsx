import { useState, useEffect } from "react";
import TeamMember from "@/components/UserCard";
import { getUsers, deleteUser } from "../api/userApi";
import { Search } from "lucide-react";

// import { get } from 'http';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  imgUrl: string;
  isDeleted: boolean;
}

const TeamPage = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const membersPerPage = 8;

  const setValue = async (e:any) => {
    setSearchTerm(e.target.value);
  }

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const sentdata = searchTerm ? searchTerm : "";
        const data = await getUsers(sentdata);
        console.log(data);
        const activeMembers = data.filter((member: { isDeleted: any; }) => !member.isDeleted);
        setTeamMembers(activeMembers);
        setFilteredMembers(activeMembers);
        setTotalPages(Math.ceil(activeMembers.length / membersPerPage));
      } catch (error) {
        console.error("Error fetching team members:", error);
      }
    };
    fetchTeamMembers();
  }, [searchTerm]);

  useEffect(() => {
    const filtered = teamMembers.filter(
      (member) => {
        // console.log(member.name)
        // return
        const searchTermLower = (searchTerm || '').toLowerCase();

        return (
          !member.isDeleted && (
            member?.name?.toLowerCase().includes(searchTermLower) ||
            member?.email?.toLowerCase().includes(searchTermLower)
          )
        );
      });
    setFilteredMembers(filtered);
    setTotalPages(Math.ceil(filtered.length / membersPerPage));
    setCurrentPage(1);
  }, [searchTerm, teamMembers]);

  // const fetchTeamMembers = async () => {
  //   try {
  //     const sentdata = searchTerm ? searchTerm : "";
  //     const data = await getUsers(sentdata);
  //     console.log(data);
  //     const activeMembers = data.filter((member: { isDeleted: any; }) => !member.isDeleted);
  //     setTeamMembers(activeMembers);
  //     setFilteredMembers(activeMembers);
  //     setTotalPages(Math.ceil(activeMembers.length / membersPerPage));
  //   } catch (error) {
  //     console.error("Error fetching team members:", error);
  //   }
  // };

  // const handleSearch = (e: any) => {
  //   setSearchTerm(e.target.value);
  // };

  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * membersPerPage,
    currentPage * membersPerPage
  );
  // console.log(filteredMembers);

  return (
    <div className="container mx-auto px-6 py-6">
      <h1 className="text-3xl font-bold mb-4 flex items-center justify-center">
        Our Team
      </h1>

      <form className="flex items-center  mb-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by Name, or Email id"
            value={searchTerm}
            onChange={(e) => setValue(e)}
            className="w-full py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-l-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2  text-gray-700 bg-background: #F6F6F6 border border-#D0D5DD rounded-r-xl hover:bg-gray-100 focus:outline-none focus:ring-1  focus:border-transparent"
        >
          Search
        </button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedMembers.map((member) => (
          <TeamMember imageUrl={""} key={member._id} {...member} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`mx-1 px-3 py-1 bg-gray-200 rounded ${currentPage === 1 ? "cursor-not-allowed	" : ""}
          `}>
          &lt;
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`mx-1 px-3 py-1 rounded ${currentPage === i + 1 ? "bg-[#561FE7] text-white" : "bg-gray-200"
              }`}
          >
            {i + 1}
          </button>

        ))}
        <button
          onClick={() =>
            setCurrentPage((next) => Math.min(next + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`mx-1 px-3 py-1 bg-gray-200 rounded ${currentPage === totalPages ? "cursor-not-allowed" : ""} `}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default TeamPage;
