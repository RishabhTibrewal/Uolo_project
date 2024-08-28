import { deleteUser } from '@/pages/api/userApi';
import Image from 'next/image';

interface TeamMemberProps {
  _id: string;
  name: string;
  email: string;
  imageUrl: string;
}

const TeamMember = ({ name, email, _id, imageUrl }: TeamMemberProps) => {
  // {console.log(imgUrl)}
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden" onClick={()=> deleteUser(_id)}>
      <img src={imageUrl} alt={name} width={200} height={200} className="w-full h-48 object-cover" />
      <div className="p-4 ">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-gray-600">{email}</p>
      </div>
    </div>
  );
};

export default TeamMember;