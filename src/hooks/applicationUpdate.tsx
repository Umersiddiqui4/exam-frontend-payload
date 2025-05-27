import axios from 'axios';

export const updateApplicationStatus = async ({
  id,
  status,
  reason, // Optional for rejected status
}: {
  id: string;
  status: 'approved' | 'rejected';
  reason?: string;
}) => {
  const payload = {
    status,
    ...(reason && { rejectionReason: reason }), // optional field
  };

  const res = await axios.patch(`https://exam-cms-payload.vercel.app/api/applications/${id}`, payload);
  return res.data;
};