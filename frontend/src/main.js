import { BACKEND_PORT } from './config.js';
import { fileToDataUrl } from './helpers.js';


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
    getBottomSidebar();
    document.getElementById("createChannel").addEventListener('click',()=>displayCreatePage());
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
    document.querySelector(".editProfilePage").style.display="none";
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
            item.addEventListener("click",()=>{
                displayChannelDescription(item);
                if(element.members.includes(parseInt(localStorage.getItem("userId")))){
                    displayMessageList(element.id);
                }
            });
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
            let editButton = document.createElement("button");
            let br1 = document.createElement("br");
            let br2 = document.createElement("br");
            let inviteButton = document.createElement("button")
            let br3 = document.createElement("br");
            let br4 = document.createElement("br");
            let leaveButton = document.createElement("button");

            channelName.textContent = data.name;
            channelName.id = `${channel.id}Name`;
            channelName.style.marginBlockEnd = "0.7em";
            channelType.textContent = "🔒 private";
            channelType.style.marginBlockStart = "0em";
            channelType.style.marginBlockEnd = "0.5em";
            if(data.private === false){
                channelType.textContent = "🔓 public";
            }
            creationTime.textContent = "Channel Creation Time";
            let curDate = new Date(data.createdAt);
            creationTimeValue.textContent = `${curDate.toLocaleDateString()} ${curDate.toLocaleTimeString()}`;
            channelDescription.textContent = "Description";
            descriptionContent.textContent = data.description;
            descriptionContent.id = `${channel.id}DescriptionContent`;
            editButton.type="button";
            editButton.id=`${channel.id}Edit`;
            editButton.className="roundedButton";
            editButton.textContent="Edit";
            editButton.style.width="98%";
            editButton.type="button";
            inviteButton.id=`${channel.id}Invite`;
            inviteButton.className="roundedButton";
            inviteButton.textContent="Invite";
            inviteButton.style.width="98%";
            leaveButton.type = "button";
            leaveButton.id=`${channel.id}Leave`;
            leaveButton.className = "roundedButton";
            leaveButton.textContent = "Leave";
            leaveButton.style.width="98%";

            item.appendChild(channelName);
            item.appendChild(channelType);
            item.appendChild(hr1);
            item.appendChild(creationTime);
            item.appendChild(creationTimeValue);
            item.appendChild(hr2);
            item.appendChild(channelDescription);
            item.appendChild(descriptionContent);
            item.appendChild(editButton);
            item.appendChild(br1);
            item.appendChild(br2);
            item.appendChild(inviteButton);
            item.appendChild(br3);
            item.appendChild(br4);
            item.appendChild(leaveButton);
            document.getElementById("channelUl").insertBefore(item,channel.nextSibling);

            editButton.addEventListener("click",()=>displayEditPage(channel.id,data.name,data.description));
            inviteButton.addEventListener("click",()=>displayInvitePage(channel.id,data.name));
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
            joinButton.style.width = "98%";
            item.appendChild(joinButton);
            document.getElementById("channelUl").insertBefore(item,channel.nextSibling);
            joinButton.addEventListener("click",()=>{
                apiCallPost(`channel/${channel.id}/join`,{},localStorage.getItem("token"))
                    .then(()=>{
                        channel.style.backgroundColor="#f2f3f5";
                        document.getElementById("channelUl").removeChild(item);
                        displayChannelDescription(channel);
                    })
                    .catch((event)=>{
                        return;
                    })
            });
        });
}

function displayMessageList(channelId){
    document.querySelector(".messageUl").style.display = "none";
    document.querySelector(".defaultPage").style.display = "flex";
    document.getElementById("sendMessage").addEventListener("click",()=>sendMessage(channelId));

    let messageList = document.getElementById("messageUl");
    while(messageList.firstChild){
        messageList.removeChild(messageList.firstChild);
    }
    let messageIndex = 0;
    apiCallGet(`message/${channelId}`,localStorage.getItem("token"),`start=${messageIndex}`)
        .then((data)=>{
            let promises = [];
            let messageDetailList = [];
            data.messages.forEach(element=>{
                let get = apiCallGet(`user/${element.sender}`,localStorage.getItem("token"),"");
                promises.push(get);
                get.then((senderData)=>{
                    messageDetailList.push([element.id,senderData,element])
                })
                .catch((error)=>{
                    return;
                })
            })
            Promise.all(promises)
                .then(()=>{
                    messageDetailList.sort((a,b)=>b[0]-a[0]);
                    messageDetailList.forEach((messageItem)=>{
                        let item = document.createElement("li");
                        item.className = "messageInstance";
                        item.id = `${messageItem[2].id}m`;
        
                        let messageHeader = document.createElement("div");
                        messageHeader.className = "messageHeader";
                        let avatar = document.createElement("img");
                        avatar.setAttribute("alt", "avatar");
                        avatar.setAttribute("id", `${messageItem[2].sender}s`);
                        avatar.setAttribute("src", "./img/avatar.png");
                        if(messageItem[1].image) avatar.setAttribute("src",messageItem[1].image);
                        avatar.setAttribute("width", "35px");
                        avatar.setAttribute("height", "35px");
                        let headerName = document.createElement("p");
                        headerName.innerText = messageItem[1].name;
                        let headerTime = document.createElement("p");
                        let sentTime = new Date(messageItem[2].sentAt);
                        headerTime.innerText = `${sentTime.toLocaleDateString()} ${sentTime.toLocaleTimeString()}`;
                        messageHeader.appendChild(avatar);
                        messageHeader.appendChild(headerName);
                        messageHeader.appendChild(headerTime);
                  
                        let messageContent = document.createElement("div");
                        messageContent.className = "messageContent";
                        messageContent.id = `${messageItem[2].id}message`;
                        let contentText = document.createElement("p");
                        contentText.innerText = messageItem[2].message;
                        messageContent.appendChild(contentText);
                    
                        item.appendChild(messageHeader);
                        item.appendChild(messageContent);
                        messageList.insertBefore(item,messageList.firstChild);
                        avatar.addEventListener("click",()=>displayProfile(messageItem[2].sender));
                        ++messageIndex;
                        document.getElementById("messageArea").scrollTop = document.getElementById("messageUl").scrollHeight;
                        if(messageList.firstChild){
                            document.querySelector(".defaultPage").style.display = "none";
                            document.querySelector(".messageUl").style.display = "block";
                        }
                    })
                })
        })
        .catch((error)=>{
            return 0;
        })
}

function displayCreatePage(){
    document.querySelector(".createChannelPage").style.display="block";
    document.getElementById("closeCreating").addEventListener('click',()=>{
        document.querySelector(".createChannelPage").style.display="none";
        document.getElementById("channelForm").reset();
    });
    document.getElementById("channelForm").addEventListener('submit',(event)=>{
        event.preventDefault();
        let name = document.getElementById("creatingChannelName").value;
        let isPivate = true;
        let description = document.getElementById("channelDescription").value;
        let token = localStorage.getItem("token");
        if(!description) description = "No description";
        if(document.getElementById("channelType").value==="public") isPivate=false;
        apiCallPost("channel",{name,isPivate,description},token)
            .then((data)=>{
                getChannelList();
            })
            .catch((error)=>{
                setAlertPage(error);
            }
        )
        document.querySelector(".createChannelPage").style.display="none";
        document.getElementById("channelForm").reset();
    })
}

function displayEditPage(channelId,name,description){
    document.querySelector(".editChannelPage").style.display="block";
    document.getElementById("closeEditing").addEventListener('click',()=>{
        document.querySelector(".editChannelPage").style.display="none";
        document.getElementById("editChannelForm").reset();
    });
    document.getElementById("editingChannelName").value = name;
    document.getElementById("editChannelDescription").value = description;
    document.getElementById("editChannelForm").addEventListener('submit',(event)=>{
        event.preventDefault();
        let name = document.getElementById("editingChannelName").value;
        let description = document.getElementById("editChannelDescription").value;
        let token = localStorage.getItem("token");
        if(!description) description = "No description";

        apiCallPut(`channel/${channelId}`,{name,description},token)
            .then((data)=>{
                document.getElementById(channelId).textContent = name;
                document.getElementById(`${channelId}Name`).textContent = name;
                document.getElementById(`${channelId}DescriptionContent`).textContent = description;
            })
            .catch((error)=>{
                setAlertPage(error);
            }
        );
        document.querySelector(".editChannelPage").style.display="none";
        document.getElementById("editChannelForm").reset();
    })

}

function displayInvitePage(channelId,name){
        document.querySelector(".inviteChannelPage").style.display="block";
        document.getElementById("inviteChannelName").value = name;
        document.getElementById("inviteButton").addEventListener("click",()=>{
            let userList = document.getElementById("UserList");
            let checkboxes = userList.querySelectorAll("input[type=checkbox]");
            let selectedUser = [];
            checkboxes.forEach(checkbox=>{
                if(checkbox.checked) selectedUser.push(checkbox.id);
            })
            selectedUser.forEach((userId)=>{
                userId = parseInt(userId.slice(0,-1));
                apiCallPost(`channel/${channelId}/invite`,{userId},localStorage.getItem("token"))
                    .then(()=>{
                        return;
                    })
                    .catch(()=>{
                        return;
                    })
            })
        });
        document.getElementById("closeInviting").addEventListener('click',()=>{
            document.querySelector(".inviteChannelPage").style.display="none";
        });
        apiCallGet(`user`,localStorage.getItem("token"),"")
            .then((data)=>{
                let promises = [];
                let userList = document.getElementById("UserList");
                while(userList.firstChild){
                    userList.removeChild(userList.firstChild);
                }
                let userNameList = [];
                data.users.forEach(item => {
                    let get = apiCallGet(`user/${item.id}`,localStorage.getItem("token"),`${data.id}`);
                    promises.push(get);
                    get.then((userDetail)=>{
                        userNameList.push([userDetail.name,item.id])
                    })
                    .catch(()=>{
                        return;
                    })
                });
                Promise.all(promises)
                    .then(()=>{
                        userNameList.sort((a,b)=>a[0].toLowerCase().localeCompare(b[0].toLowerCase()));
                        userNameList.forEach((item)=>{
                            let li = document.createElement("li");
                            let checkbox = document.createElement("input");
                            checkbox.type = "checkbox";
                            checkbox.id = `${item[1]}c`;
                            let label = document.createElement("label");
                            label.textContent = item[0]; 
                            li.appendChild(checkbox);
                            li.appendChild(label);
                            userList.appendChild(li);
                        })
                    });
                }
            )
            .catch((error)=>{
                return;
            })
    }

function getBottomSidebar(){
    apiCallGet(`user/${localStorage.getItem("userId")}`,localStorage.getItem("token"),"")
        .then((data)=>{
            if(data.image){
                document.getElementById("userAvatar").src = data.image;
            }
            document.getElementById("userName").textContent = data.name;
            document.getElementById("userAvatar").addEventListener("click",()=>{
                displayProfile(localStorage.getItem("userId"))
            });
        })
        .catch((error)=>{
            return;
        });
}

function sendMessage(channelId){
    let image = "";
    let message = document.getElementById("inputMessage").value;
    if(!message || !message.trim()) return;
    document.getElementById("inputMessage").value = "";
    apiCallPost(`message/${channelId}`,{message,image},localStorage.getItem("token"))
        .then(()=>{
            displayMessageList(channelId);
        })
        .catch(()=>{
            return;
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
    document.querySelector(".messageUl").style.display = "none";
    document.querySelector(".defaultPage").style.display = "flex";
}

function displayProfile(userId){
    document.querySelector(".profilePage").style.display="block";
    document.getElementById("closeProfile").addEventListener("click",()=>{
        document.querySelector(".profilePage").style.display="none";
    })
    if(userId === localStorage.getItem("userId")){
        document.getElementById("editProfile").style.display = "block";
        document.getElementById("editProfile").addEventListener("click",()=>displayEditProfile());
    }
    else{
        document.getElementById("editProfile").style.display = "none";
    }
    apiCallGet(`user/${userId}`,localStorage.getItem("token"),"")
        .then((data)=>{
            if(data.bio){
                document.getElementById("profileBio").textContent=data.bio;
            }
            document.getElementById("profileEmail").textContent=data.email;
            document.getElementById("profileName").textContent=data.name;
            document.getElementById("profileImg").src="./img/avatar.png"
            if(data.image) document.getElementById("profileImg").src=data.image;    
        })
        .catch((error)=>{
            setAlertPage(error);
        }
    );
}

function displayEditProfile(){
    document.querySelector(".profilePage").style.display="none";
    document.querySelector(".editProfilePage").style.display="block";
    apiCallGet(`user/${localStorage.getItem("userId")}`,localStorage.getItem("token"),"")
        .then((data)=>{
            document.getElementById("bioProfile").value = "No biography"
            if(data.bio){
                document.getElementById("bioProfile").value=data.bio;
            }
            document.getElementById("emailProfile").value=data.email;
            document.getElementById("nameProfile").value=data.name;
            document.getElementById("editProfileImg").src="./img/avatar.png"
            if(data.image) document.getElementById("editProfileImg").src=data.image;    
        })
        .catch((error)=>{
            setAlertPage(error);
        }
    );
    document.getElementById("profileForm").addEventListener("submit",(event)=>submitEditingProfile(event))
    document.getElementById("closeEditProfile").addEventListener("click",()=>{
        document.getElementById("profileForm").reset();
        document.querySelector(".editProfilePage").style.display="none";
    })
}

function submitEditingProfile(event){
    event.preventDefault();
    let name = document.getElementById('nameProfile').value;
    let email = document.getElementById('emailProfile').value;
    let password = document.getElementById('passwordProfile').value;
    let bio = document.getElementById('bioProfile').value;
    let fileInput = document.getElementById("uploadAvatar");
    fileToDataUrl(fileInput.files[0])
        .then(image => {
        let body={name,email,password,bio,image};
        apiCallPut('user',body,localStorage.getItem("token"))
            .then((data)=>{
                localStorage.setItem("email",email);
                localStorage.setItem("password",password);
                document.getElementById("profileForm").reset();
                autoLogin();
            })
            .catch((error)=>{
                if(error==="Email address already taken")
                {
                    localStorage.setItem("email",email);
                    localStorage.setItem("password",password);
                }
                document.getElementById("profileForm").reset();
                autoLogin();
            }
        );
    });   
}

function apiCallPost(path, body, token){
    let headers = {'accept': 'application/json','Content-type': 'application/json',};
    if(token){
        headers = {'accept': 'application/json','Content-type': 'application/json','Authorization': `Bearer ${token}`};
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
                'accept': 'application/json',
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

function apiCallPut(path, body, token){
    let headers = {'accept': 'application/json','Content-type': 'application/json',};
    if(token){
        headers = {'accept': 'application/json','Content-type': 'application/json','Authorization': `Bearer ${token}`};
    }
    return new Promise((resolve,reject) =>{
        fetch(`http://localhost:5005/` + path, {
            method: 'PUT',
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