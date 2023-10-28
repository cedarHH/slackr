console.log('Let\'s go!');

let scrollPosition = 0;

startPage();
autoLogin();

function startPage(){
    document.getElementById("register2login").addEventListener("click",()=>{
        document.querySelector(".Login").style.display ="flex";
        document.querySelector(".Register").style.display ="none";
    });
    
    document.getElementById("login2register").addEventListener("click",()=>{
        document.querySelector(".Login").style.display ="none";
        document.querySelector(".Register").style.display ="flex";
    });
     
    document.getElementById("loginForm").addEventListener("submit",(event)=>login(event));
    document.getElementById("registerForm").addEventListener("submit",(event)=>register(event));
}

function homePage(){
    getChannelList();
    document.getElementById("createChannel").addEventListener('click',()=>displayFormPage());
    document.getElementById("logOutButton").addEventListener('click',()=>logOut());
}

function login(event){
    event.preventDefault();
    const email = document.getElementById("emailLogin").value;
    const password= document.getElementById("passwordLogin").value;
    apiCallPost("auth/login",{email,password})
        .then((data)=>{
            localStorage.setItem("email",email);
            localStorage.setItem("password",password);
            localStorage.setItem("token",data.token);
            localStorage.setItem("userId",data.userId);
            successfulLogin();
        })
        .catch((error)=>{
            setAlertPage(error);
        }
    )
}

function register(event){
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
            successfulLogin();
        })
        .catch((error)=>{
            setAlertPage(error);
        }
    )
}

function successfulLogin(){
    document.querySelector(".Startpage").style.display="none";
    document.querySelector(".footer").style.display="none";
    document.querySelector(".Homepage").style.display="flex";
    document.querySelector("body").style.backgroundColor="#e3e5e8";
    homePage()
}

function autoLogin(){
    let email = localStorage.getItem("email");
    let password = localStorage.getItem("password");
    if(email && password){
        apiCallPost("auth/login",{email,password})
            .then((data)=>{
                localStorage.setItem("token",data.token);
                localStorage.setItem("userId",data.userId);
                successfulLogin();
            })
            .catch((error)=>{
                return;
            }
        )
    }
}

function setAlertPage(message){
    document.querySelector(".Alertpage").style.display="block";
    document.getElementById("alertText").innerText=message;
    document.getElementById("alertButton").addEventListener("click",()=>{
        document.querySelector(".Alertpage").style.display="none";
    })
}

function getChannelList(){
    apiCallGet('channel',localStorage.getItem("token"),'')
    .then((data)=>{
        let list = document.getElementById("channelUl");
        let items = Array.from(list.getElementsByTagName("li"));
        items.forEach(item => {
            if(item.id != "test1"&&item.id != "channelHeader"&&item.id != "publicChannel"&&item.id != "privateChannel"){
                list.removeChild(item);
            }
        });
        data.channels.forEach(element => {
            if(!element.members.includes(parseInt(localStorage.getItem("userId")))&&element.private){
                return;
            }
            let item = document.createElement('li');
            item.id = element.id;
            if(element.private === false){
                document.getElementById("channelUl").insertBefore(item,document.getElementById("privateChannel"));
            }
            else{
                document.getElementById("channelUl").appendChild(item);
            }
            item.className='channelName';
            item.textContent=element.name;
            item.addEventListener("click",()=>displayChannelDescription(item));
        });
        document.getElementById('channelContainer').addEventListener('wheel', (event)=>infiniteScroll(event,"channelContainer","channelUl")); 
    })
    .catch((error)=>{
        return;
    })
}

function displayChannelDescription(channel){
    if(channel.nextSibling && channel.nextSibling.id === `${channel.id}Description`){
        channel.style.backgroundColor="#f2f3f5";
        document.getElementById("channelUl").removeChild(channel.nextSibling);
        return;
    }
    channel.style.backgroundColor="#e0e1e5";

    apiCallGet(`channel/${channel.id}`,localStorage.getItem("token"),'')
        .then((data)=>{
            let item = document.createElement('li');
            item.className='channelDescription';
            item.id = `${channel.id}Description`;

            let channelName = document.createElement("h4");
            let channelType = document.createElement("p");
            let hr1 = document.createElement("hr");
            let creationTime = document.createElement("h5");
            let hr2 = document.createElement("hr");
            let creationTimeValue = document.createElement("p");
            let channelDescription = document.createElement("h5");
            let descriptionContent = document.createElement("p");
            let leaveButton = document.createElement("button");

            channelName.textContent = data.name;
            channelType.textContent = "private channel";
            if(data.private === false){
                channelType.textContent = "public channel";
            }
            creationTime.textContent = "Channel Creation Time";
            let curDate = new Date(data.createdAt);
            creationTimeValue.textContent = `${curDate.toLocaleDateString()} ${curDate.toLocaleTimeString()}`;
            channelDescription.textContent = "Description";
            descriptionContent.textContent = data.description;
            leaveButton.type = "button";
            leaveButton.id=`${channel.id}Leave`;
            leaveButton.className = "roundedButton";
            leaveButton.textContent = "Leave";

            item.appendChild(channelName);
            item.appendChild(channelType);
            item.appendChild(hr1);
            item.appendChild(creationTime);
            item.appendChild(creationTimeValue);
            item.appendChild(hr2);
            item.appendChild(channelDescription);
            item.appendChild(descriptionContent);
            item.appendChild(leaveButton);
            document.getElementById("channelUl").insertBefore(item,channel.nextSibling);
            leaveButton.addEventListener("click",()=>{
                apiCallPost(`channel/${channel.id}/leave`,{},localStorage.getItem("token"))
                    .then(()=>{
                        channel.style.backgroundColor="#f2f3f5";
                        if(data.private){
                            document.getElementById("channelUl").removeChild(channel);
                        }
                        document.getElementById("channelUl").removeChild(item);
                    })
                    .catch((event)=>{
                        return;
                    });
            });
        })
        .catch((error)=>{
            let item = document.createElement('li');
            item.className='channelDescription';
            item.id = `${channel.id}Description`;
            let joinButton = document.createElement("button");
            joinButton.type = "button";
            joinButton.id=`${channel.id}Join`;
            joinButton.className = "roundedButton";
            joinButton.textContent = "Join";
            item.appendChild(joinButton);
            document.getElementById("channelUl").insertBefore(item,channel.nextSibling);
            joinButton.addEventListener("click",()=>{
                apiCallPost(`channel/${channel.id}/join`,{},localStorage.getItem("token"))
                    .then(()=>{
                        channel.style.backgroundColor="#f2f3f5";
                        document.getElementById("channelUl").removeChild(item);
                    })
                    .catch((event)=>{
                        return;
                    })
            });
        });
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
    if((container.clientHeight-list.clientHeight)>=0) return;
    if (event.deltaY > 0) {
        scrollPosition += 50;
    } else {
        scrollPosition -= 50;
    }
    scrollPosition = Math.min(0, scrollPosition);
    scrollPosition = Math.max(container.clientHeight-list.clientHeight-20, scrollPosition);
    list.style.transform = `translateY(${scrollPosition}px)`;
}

function logOut(){
    localStorage.removeItem("email");
    localStorage.removeItem("password");
    localStorage.removeItem("userId");
    localStorage.removeItem("token");
    document.querySelector(".Startpage").style.display="block";
    document.querySelector(".footer").style.display="flex";
    document.querySelector(".Homepage").style.display="none";
    document.querySelector("body").style.backgroundColor="#fafafa";
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
    if(queryString) queryString = `?${queryString}`;
    return new Promise((resolve,reject) =>{
        fetch(`http://localhost:5005/` + path + queryString, {
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