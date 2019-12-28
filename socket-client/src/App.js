import React, { Component } from "react";
import socketIOClient from "socket.io-client";
import './style.css'

class App extends Component {
  constructor() {
    super();
    this.state = {
      response: false,
      endpoint: "http://127.0.0.1:8000", // puede reemplazarse
      counter: 1,
      username: false,
      socket: socketIOClient('http://127.0.0.1:8000'),
      messages : []
    };

    this.setUsername = this.setUsername.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getUsernameColor = this.getUsernameColor.bind(this);
  }

  getUsernameColor(username){
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

  setUsername(e){
    const socket = this.state.socket

    if (e.key === 'Enter'){
      this.setState({username: e.target.value},
        function () {
          if (this.state.username !== 'false')
            socket.emit('add user', this.state.username);
        }.bind(this));
    }
  }

  sendMessage(e){
    const socket = this.state.socket
  
    const data = {
      username: this.state.username,
      message: e.target.value,
      type: 'message'
    }

    if (e.key === 'Enter'){
      socket.emit('new message', e.target.value);
      this.setState({
        messages : this.state.messages.concat(data)
      })
      e.target.value = '';
      window.scrollBy(0, 100)
    }
  }
  
  componentDidMount() {

    const socket = this.state.socket

    // Whenever the server emits 'login', log the login message
    socket.on('login', (data) => {
      // Display the welcome message
      data.type = 'login';
      this.setState({
        messages : this.state.messages.concat(data)
      })
    });
    
    // Whenever the server emits 'new message', update the chat body
    socket.on('new message', (data) => {
      data.type = 'message';
      this.setState({
        messages : this.state.messages.concat(data)
      })
    });
    // Whenever the server emits 'user joined', log it in the chat body
    socket.on('user joined', (data) => {
      data.type = 'log';
      data.status = 'joined'
      this.setState({
        messages : this.state.messages.concat(data)
      })
    });
    // Whenever the server emits 'user left', log it in the chat body
    socket.on('user left', (data) => {      
      data.type = 'log';
      data.status = 'left'
      this.setState({
        messages : this.state.messages.concat(data)
      })
    });
    // Whenever the server emits 'typing', show the typing message
    socket.on('typing', (data) => {
      console.log('typing', data);
    });
    // Whenever the server emits 'stop typing', kill the typing message
    socket.on('stop typing', (data) => {    
      console.log('stop typing', data);
    });
    socket.on('disconnect', () => {
      console.log('you have been disconnected');
    });
    socket.on('reconnect', () => {
      console.log('you have been reconnected');
      if (this.state.username !== 'false') {
        socket.emit('add user', this.state.username);
      }
    });
    socket.on('reconnect_error', () => {
      console.log('attempt to reconnect has failed');
    });
  }

  render() {
    return (
      <ul className="pages">

        {this.state.username ? 

        <li className="chat page">

          <div className="chatArea">

            <ul className="messages">

              {this.state.messages.map(x => 

                {if (x.type === 'message'){
                  return (
                    <li className="message" style={{display: "list-item"}}>
                      <span className="username" style={{color: this.getUsernameColor(x.username)}}>{x.username}</span>
                      <span className="messageBody">{x.message}</span>
                    </li>)
                }
                if (x.type === 'login'){
                  return [(
                    <li className="log" style={{display: "list-item"}}>
                      Welcome to Socket Project : Socket Chat – 
                    </li>),
                    x.numUsers === 1 ?
                    <li className="log" style={{display: "list-item"}}>
                      there's 1 participant
                    </li>
                    :
                    <li className="log" style={{display: "list-item"}}>
                      there are {x.numUsers} participants
                    </li>
                  ]
                }
                if (x.type === 'log'){
                  return [(
                    <li className="log" style={{display: "list-item"}}>
                      {x.username} {x.status}
                    </li>),
                    x.numUsers === 1 ?
                    <li className="log" style={{display: "list-item"}}>
                      there's 1 participant
                    </li>
                    :
                    <li className="log" style={{display: "list-item"}}>
                      there are {x.numUsers} participants
                    </li>
                  ]
                }
                return <li>Vaci</li>
                }
              )}
            </ul>
          </div>
          <input autoFocus className="inputMessage" placeholder="Type here..." onKeyDown={this.sendMessage.bind(this)}/>
        </li>
        :
        <li className="login page">
          <div className="form">
            <h3 className="title">What's your nickname?</h3>
             <input className="usernameInput" type="text" maxLength="14" onKeyDown={this.setUsername.bind(this)}/>
          </div>
        </li>        
        }
      </ul>
    );
  }
}
export default App;