import { Component, Renderer2, ElementRef } from '@angular/core'
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

  constructor(private renderer: Renderer2, private el: ElementRef) { }

  ngOnInit() {
    console.log('Init Main')

    // Whenever the server emits 'login', log the login message
    this.socket.on('login', (data) => {
      // Display the welcome message
      data.type = 'login';
      this.messages = this.messages.concat(data)
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
    });
    // Whenever the server emits 'user left', log it in the chat body
    this.socket.on('user left', (data) => {
      data.type = 'log';
      data.status = 'left'
      this.messages = this.messages.concat(data)
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
    const p = this.renderer.createElement('p');
    p.innerHTML = "add new"
    this.renderer.appendChild(this.el.nativeElement, p)
    console.log(this.el.nativeElement)
  }

}
