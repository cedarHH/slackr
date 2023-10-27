console.log('Let\'s go!');

let scrollPosition = 0;

startPage();
//autoLogin();

function startPage(){
    document.getElementById("register2login").addEventListener("click",()=>{
        document.querySelector(".Login").style.display ="flex";
        document.querySelector(".Register").style.display ="none";
    })
    
    document.getElementById("login2register").addEventListener("click",()=>{
        document.querySelector(".Login").style.display ="none";
        document.querySelector(".Register").style.display ="flex";
    })
     
    document.getElementById("loginForm").addEventListener("submit",(event)=>{
        event.preventDefault();
        const email = document.getElementById("emailLogin").value;
        const password= document.getElementById("passwordLogin").value;
        apiCallPost("auth/login",{email,password})
            .then((data)=>{
                localStorage.setItem("email",email);
                localStorage.setItem("password",password);
                localStorage.setItem("token",data.token);
                localStorage.setItem("userId",data.userId);
                successfulLog();
            })
            .catch((error)=>{
                setAlertPage(error);
            }
        )
    })
    
    document.getElementById("registerForm").addEventListener("submit",(event)=>{
        event.preventDefault();
        const name = document.getElementById("nameRegister").value;
        const email = document.getElementById("emailRegister").value;
        const password= document.getElementById("passwordRegister").value;
        const conformPassword = document.getElementById("confirm_passwordRegister").value;
        if(password!==conformPassword){
            setAlertPage("Passwords do not match");
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
                setAlertPage(error);
            }
        )
    })
}

function successfulLog(){
    document.querySelector(".Loginpage").style.display="none";
    document.querySelector(".footer").style.display="none";
    document.querySelector(".Homepage").style.display="flex";
    document.querySelector("body").style.backgroundColor="#e3e5e8";
    main()

}

function main(){
    getChannelList();
    document.getElementById("createChannel").addEventListener('click',()=>{displayFormPage()});
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

function setAlertPage(message){
    document.querySelector(".Alertpage").style.display="block";
    document.getElementById("alertText").innerHTML=message;
    document.getElementById("alertButton").addEventListener("click",()=>{
        document.querySelector(".Alertpage").style.display="none";
    })
}

function getChannelList(){
    apiCallGet('channel',localStorage.getItem("token"),'')
    .then((data)=>{
        data.channels.forEach(element => {
            let item = document.getElementById(element.id);
            if(!item){
                item = document.createElement('li');
                item.id = element.id;
                document.getElementById("channelUl").appendChild(item);
            }
            item.className='channelName';
            item.textContent=element.name;
        });
        document.getElementById('channelContainer').addEventListener('wheel', (event)=>infiniteScroll(event,"channelContainer","channelUl")); 
    })
    .catch((error)=>{
        return;
    })
}

function displayFormPage(){
    document.querySelector(".formpage").style.display="block";
    document.getElementById("closeCreating").addEventListener('click',()=>{
        document.querySelector(".formpage").style.display="none";
        document.getElementById("channelForm").reset();
    });
    document.getElementById("channelForm").addEventListener('submit',(event)=>{
        event.preventDefault();
        let name = document.getElementById("creatingChannelName").value;
        let private = true;
        let description = document.getElementById("channelDescription").value;
        let token = localStorage.getItem("token");
        if(!description) description = "No description";
        if(document.getElementById("channelType").value==="public") private=false;
        apiCallPost("channel",{name,private,description},token)
            .then((data)=>{
                getChannelList();
            })
            .catch((error)=>{
                setAlertPage(error);
            }
        )
        document.querySelector(".formpage").style.display="none";
        document.getElementById("channelForm").reset();
    })
}

function infiniteScroll(event,containerId,listId){
    let container = document.getElementById(containerId);
    let list = document.getElementById(listId);
    if (event.deltaY > 0) {
        scrollPosition += 50;
    } else {
        scrollPosition -= 50;
    }
    scrollPosition = Math.max(0, scrollPosition);
    scrollPosition = Math.min(container.clientHeight-list.clientHeight-20, scrollPosition);
    list.style.transform = `translateY(${scrollPosition}px)`;
}


function apiCallPost(path, body, token){
    let headers = {'Content-type': 'application/json',};
    if(token){
        headers = {'Content-type': 'application/json','Authorization': `Bearer ${token}`};
    }
    return new Promise((resolve,reject) =>{
        fetch(`http://localhost:5005/` + path, {
            method: 'POST',
            headers: headers,
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

function apiCallGet(path, token, queryString){
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



