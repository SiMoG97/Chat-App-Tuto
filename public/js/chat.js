const socket = io()


//elements
const msgForm = document.querySelector('#chat-form')
const myInput = msgForm.querySelector('input')
const myBTN = msgForm.querySelector('button[name="submit-btn"]')
const shareLocBtn = document.querySelector('#shareLocation');

const messageTemplete = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const chatField = document.querySelector('#chatField')
const usersTemplate = document.querySelector('#users-template').innerHTML

const searchQueries = Qs.parse(location.search.trim().toLowerCase(),{ignoreQueryPrefix:true})

myBTN.disabled = true
myInput.addEventListener('keyup',()=>{
    if(myInput.value.length === 0){
        myBTN.disabled = true
    }else{
        myBTN.disabled = false
    }
})

const autoScroll = ()=>{
    const newMessage = chatField.lastElementChild 
    const newMessageStyle = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin
    const visibleHeight = chatField.offsetHeight
    const chatFieldHeight = chatField.scrollHeight
    const ScrollOfsset = chatField.scrollTop + visibleHeight
    if(chatFieldHeight - newMessageHeight <= ScrollOfsset){
        chatField.scrollTop = chatFieldHeight
    }
}

document.querySelector('#chat-form').addEventListener('submit',(e)=>{
    e.preventDefault()
    socket.emit('messageSend', myInput.value,(message)=>{
        console.log('✓')
    })
    myInput.value =''
    myInput.focus()
    myBTN.disabled = true
})

socket.on('message',({message,createdAt,username})=>{
    const html = Mustache.render(messageTemplete,{ 
        message,
        createdAt: moment(createdAt).format('hh:mm a'),
        username
    })
    chatField.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

shareLocBtn.addEventListener('click',()=>{
    if(!navigator.geolocation) return alert('Your browser does not support geolocation')
    shareLocBtn.disabled = true
    navigator.geolocation.getCurrentPosition( position => {
        const {latitude,longitude} = position.coords
        socket.emit('sendlocation',{latitude,longitude},()=>{
            shareLocBtn.disabled = false
        })
    })
})

socket.on('LocationSend',({message,createdAt,username})=>{
    const html = Mustache.render(locationTemplate,{
        locationLink : message,
        createdAt : moment(createdAt).format('hh:mm a'),
        username
    })
    chatField.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

socket.emit('join', searchQueries,(error)=>{
    if(error) return location.href='/'
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(usersTemplate,{
        room,
        users
    })
    document.querySelector('#chat__sidebar').innerHTML = html
})