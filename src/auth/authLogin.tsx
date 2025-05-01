export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    
    // Validate that both email and password are provided
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }
  
    // Simulate a delay as if checking credentials in a real app
    await new Promise(resolve => setTimeout(resolve, 1000));
  
    // Check if the email contains '@' to simulate a successful login
    if (email.includes('@')) {
      // On success, return the updated state with the email
      return { ...prevState, email }; // You can add other state values if needed
    } else {
      // Return an error if the email is invalid
      return { error: 'Invalid email or password' };
    }
  }
  