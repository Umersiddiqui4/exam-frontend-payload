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

  const res = await axios.patch(`http://localhost:3000/api/applications/${id}`, payload);
  return res.data;
};