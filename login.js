function register() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
   console.log("after details")
  fetch('http://localhost:9000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, email, password })
  })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        alert('Registration successful!');
      } else {
        alert(`Registration failed: ${result.error}`);
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An unexpected error occurred. Please try again.');
    });
}
