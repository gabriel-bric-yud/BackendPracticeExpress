let usernameBtn = document.getElementById("usernameBtn")
let loginForm = document.getElementById("login-form")

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  await fetch(e.target.action, {
    method: "POST",
    body: formData
  })
  .then(data => data.json())
  .then(res => {
    if (res.ok) {
      alert("Successful")
    }
    else {
      alert("failed")
    }

  })
})





/**

async function MySQLFormDataRequest(url = "", dataArray = []) {
  let formData = new FormData();
  for (let i = 0; i < dataArray.length; i++) {
    formData.append(dataArray[i][0], dataArray[i][1])
  }
  const response = await fetch(url, { 
    method: "POST", 
    mode: "cors",
    headers: { "Accept": "application/json" },  
    body: formData 
  });
  return response; 
}


usernameBtn.addEventListener("click", (e) => {
  fetch("http://localhost:4000/user_auth_old", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: "testUser3",
      password: "12345"
    })
  });
})


 */