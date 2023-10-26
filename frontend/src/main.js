//import { BACKEND_PORT } from './config.js';
// // A helper you may want to use when uploading new images to the server.
// import { fileToDataUrl } from './helpers.js';

console.log('Let\'s go!');

let scrollPosition = 0;

document.getElementById("register2login").addEventListener("click",()=>{
    document.querySelector(".Login").style.display ="flex";
    document.querySelector(".Register").style.display ="none";
})

document.getElementById("login2register").addEventListener("click",()=>{
    document.querySelector(".Login").style.display ="none";
    document.querySelector(".Register").style.display ="flex";
})
 
document.getElementById("loginForm").addEventListener("submit",(event)=>{
    event.preventDefault()
    const email = document.getElementById("emailLogin").value
    const password= document.getElementById("passwordLogin").value
    apiCallPost("auth/login",{email,password})
        .then((data)=>{
            localStorage.setItem("email",email);
            localStorage.setItem("password",password);
            localStorage.setItem("token",data.token);
            localStorage.setItem("userId",data.userId);
            successfulLog();
        })
        .catch((error)=>{
            alertPage(error);
        }
    )
})

document.getElementById("registerForm").addEventListener("submit",(event)=>{
    event.preventDefault()
    const name = document.getElementById("nameRegister").value;
    const email = document.getElementById("emailRegister").value;
    const password= document.getElementById("passwordRegister").value;
    const conformPassword = document.getElementById("confirm_passwordRegister").value;
    if(password!==conformPassword){
        alertPage("Passwords do not match");
        return;
    }
    apiCallPost("auth/register",{email,password,name})
        .then((data)=>{
            localStorage.setItem("email",email);
            localStorage.setItem("password",password);
            localStorage.setItem("token",data.token);
            localStorage.setItem("userId",data.userId);
            successfulLog();
        })
        .catch((error)=>{
            alertPage(error);
        }
    )
})

const alertPage = (message) =>{
    document.querySelector(".Alertpage").style.display="block";
    document.getElementById("alertText").innerHTML=message;
    document.getElementById("alertButton").addEventListener("click",()=>{
        document.querySelector(".Alertpage").style.display="none";
    })
}

function autoLogin(){
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    if(email && password){
        apiCallPost("auth/login",{email,password})
            .then((data)=>{
                localStorage.setItem("token",data.token);
                localStorage.setItem("userId",data.userId);
                successfulLog();
            })
            .catch((error)=>{
                return;
            }
        )
    }
}

function successfulLog(){
    const userId = localStorage.getItem("userId");
    const userToken = localStorage.getItem("token");
    document.querySelector(".Loginpage").style.display="none";
    document.querySelector(".footer").style.display="none";
    document.querySelector(".Homepage").style.display="flex";
    document.querySelector("body").style.backgroundColor="#f4b028";
    apiCallGet('channel',userToken,'')
        .then((data)=>{
            console.log(data)
        })
        .catch((error)=>{
            return;
        })
    //document.getElementById('channelContainer').addEventListener('wheel', infiniteScroll.bind(this,scrollPosition,"channelContainer","channelUl"));
}

const apiCallPost = (path, body) => {
    return new Promise((resolve,reject) =>{
        fetch(`http://localhost:5005/` + path, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify(body)
        })
        .then((response) => response.json())
        .then((data) => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
        })
        .catch((error) => {
            reject(error);
        });
    });
};

const apiCallGet = (path, token, queryString) => {
    return new Promise((resolve,reject) =>{
        fetch(`http://localhost:5005/` + path + '?' + queryString, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        .then((response) => response.json())
        .then((data) => {
        if (data.error) {
          reject(data.error);
        } else {
          resolve(data);
        }
        })
        .catch((error) => {
            reject(error);
        });
    });
};

// function infiniteScroll(event,scrollPosition,containerId,listId){
//     if (event.deltaY > 0) {
//         scrollPosition += 50;
//     } else {
//         scrollPosition -= 50;
//     }
//     let container = document.getElementById(containerId);
//     let list = document.getElementById(listId);
    
//     scrollPosition = Math.min(0, scrollPosition);
//     const maxHeight = list.clientHeight - container.clientHeight;
//     scrollPosition = Math.max(-maxHeight*1.1, scrollPosition);
//     list.style.transform = `translateY(${scrollPosition}px)`;
// }

document.getElementById("channelContainer").addEventListener("wheel",(event)=>{
    if (event.deltaY > 0) {
        scrollPosition += 50;
    } else {
        scrollPosition -= 50;
    }
    let container = document.getElementById("channelContainer");
    let list = document.getElementById("channelUl");
    
    scrollPosition = Math.min(0, scrollPosition);
    const maxHeight = list.clientHeight - container.clientHeight;
    scrollPosition = Math.max(-maxHeight*1.1, scrollPosition);
    list.style.transform = `translateY(${scrollPosition}px)`;
})

autoLogin();


