import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const useSubmitApplication = () => {
  return useMutation({
    mutationFn: async (application) => {
      const response = await axios.post(
        "https://exam-cms-payload.vercel.app/api/applications",
        application,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
  });
};

export default useSubmitApplication;
