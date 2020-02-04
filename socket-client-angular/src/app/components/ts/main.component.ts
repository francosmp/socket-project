import { Component, Renderer2, ElementRef, ViewChild } from '@angular/core'
import socketIOClient from "socket.io-client"

@Component({
  selector: 'main',
  templateUrl: '../html/main.component.html',
  styleUrls: ['../css/main.component.css']
})

export class MainComponent {

  response = false
  endpoint = "http://127.0.0.1:8000" // puede reemplazarse
  counter = 1
  username = ''
  socket = socketIOClient('http://127.0.0.1:8000')
  messages = []
  chatPage = false

  @ViewChild('mensajes', { static: false }) private mensajes: ElementRef

  constructor(private renderer: Renderer2) {
  }

  ngOnInit() {

    // Whenever the server emits 'login', log the login message
    this.socket.on('login', (data) => {
      // Display the welcome message
      data.type = 'login';
      this.messages = this.messages.concat(data)
      this.addMessage()
    });

    // Whenever the server emits 'new message', update the chat body
    this.socket.on('new message', (data) => {
      data.type = 'message';
      this.messages = this.messages.concat(data)
      this.addMessage()
    });
    // Whenever the server emits 'user joined', log it in the chat body
    this.socket.on('user joined', (data) => {
      data.type = 'log';
      data.status = 'joined'
      this.messages = this.messages.concat(data)
      this.addMessage()
    });
    // Whenever the server emits 'user left', log it in the chat body
    this.socket.on('user left', (data) => {
      data.type = 'log';
      data.status = 'left'
      this.messages = this.messages.concat(data)
      this.addMessage()
    });

  }

  setUsername(e) {
    this.username = e.target.value
    this.socket.emit('add user', this.username)
    this.chatPage = true
  }

  sendMessage(e) {
    const data = {
      username: this.username,
      message: e.target.value,
      type: 'message'
    }
    this.socket.emit('new message', e.target.value);
    this.messages = this.messages.concat(data)
    e.target.value = ''
    this.addMessage()
  }

  addMessage() {
    const li = this.renderer.createElement('li')
    const span1 = this.renderer.createElement('span')
    const span2 = this.renderer.createElement('span')
    const lastMessage = this.messages[this.messages.length - 1]
    var li2 = null

    if (lastMessage.type === 'log') {
      li.className = 'log'
      li.innerHTML = lastMessage.username + ' ' + lastMessage.status
      li2 = this.renderer.createElement('li')
      li2.className = 'log'
      if (lastMessage.numUsers === 1) {
        li2.innerHTML = 'there\'s 1 participant'
      } else {
        li2.innerHTML = 'there are ' + lastMessage.numUsers + ' participants'
      }
    }

    if (lastMessage.type === 'login') {
      li.className = 'log'
      li.innerHTML = 'Welcome to Socket Project : Socket Chat – Angular'
      li2 = this.renderer.createElement('li')
      li2.className = 'log'
      if (lastMessage.numUsers === 1) {
        li2.innerHTML = 'there\'s 1 participant'
      } else {
        li2.innerHTML = 'there are ' + lastMessage.numUsers + ' participants'
      }
    }

    if (lastMessage.type === 'message') {
      li.className = 'message'
      span1.innerHTML = lastMessage.username
      span1.style.color = this.getUsernameColor(lastMessage.username)
      span1.className = 'username'
      span2.innerHTML = lastMessage.message
      span2.className = 'messageBody'
      this.renderer.appendChild(li, span1)
      this.renderer.appendChild(li, span2)
      this.renderer.appendChild(this.mensajes.nativeElement, li)
    }

    if (li !== undefined) { this.renderer.appendChild(this.mensajes.nativeElement, li) }

    if (li2 !== null) {
      this.renderer.appendChild(this.mensajes.nativeElement, li2)
    }

  }

  getUsernameColor(username) {
    var COLORS = [
      '#e21400', '#91580f', '#f8a700', '#f78b00',
      '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
      '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ];
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

}
