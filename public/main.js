var socket = io()
const uniqueId = document.querySelector('#uniqueId')
const bigV = document.querySelector('#myVideo')
const smallV = document.querySelector('#friendVideo')
const form = document.querySelector('#form')
const input = document.querySelector('#input')
const peer = new Peer()

peer.on('open', id => {
    socket.emit('peer', id)
})

// ;(async() => {
//     const data = await window.navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: false,
//         peerIdentity: true
//     })
//     myVideo.srcObject = data
// })()

socket.on('ulandi', id => {
    uniqueId.innerHTML = id
})

document.addEventListener('keypress', (e) => {
    if(e.keyCode === 13){
        socket.emit('call', input.value.trim())
        input.value = ''
    }
})

socket.on('error', e => alert(e))

socket.on('call', id => {
    var conn = peer.connect(id)
    console.log(conn)
    conn.on('open', async() => {
        const data = await window.navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
            peerIdentity: true
        })
        let call = peer.call(id, data)
        call.on('stream', remotoStrim => {
            bigV.srcObject = remotoStrim
        })
    })
})

peer.on('call', async conn => {
    const data = await window.navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
        peerIdentity: true
    })
    conn.answer(data)
    conn.on('stream', (remoteStrim) => {
        smallV.srcObject = remoteStrim
    })
})