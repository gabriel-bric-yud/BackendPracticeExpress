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

let usernameBtn = document.getElementById("usernameBtn")

usernameBtn.addEventListener("click", (e) => {
  fetch("http://localhost:4000/user_auth", {
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

let secondaryBtn = document.getElementById("secondaryBtn")
