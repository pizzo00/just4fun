import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Chat, ChatService} from "../services/chat.service";
import {UserService} from "../services/user.service";
import {Router} from "@angular/router";
import {SocketioService} from "../services/socketio.service";
import {last} from "rxjs/operators";
import {on} from "socket.io-client/build/on";
import {event} from "jquery";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnChanges { //rappresenta una singola chat

  @Input() chat: Chat = null;
  userMail;
  chatTitle;

  // if user is not logged in return to home
  constructor(private chatService: ChatService, private userService: UserService, private router: Router,
              private ios: SocketioService) {
    if (!this.userService.isLoggedIn && router.url.split('/').pop() == 'messages')
      router.navigate(['/']);
  }

  ngOnInit(): void {
    this.userMail = this.userService.email;
    // set chat title to display
    if (this.chat.matchID !== null) {
      this.chatTitle = 'Match chat'
    }
    else {
      this.ios.connect().subscribe((message)=>{
        if (message.subject === 'newMessageReceived') {
          console.log('start fetching');
          this.chat.fetchChat();
          console.log('fetch ended');
        }
      });
      this.chatTitle = this.chat.members[0] == this.userMail ? this.chat.members[1] : this.chat.members[0]
    }
  }

  // activated when another chat is selected from chatsComponent
  ngOnChanges(changes: SimpleChanges){
    if (changes.chat.currentValue.matchID !== null)
      this.chatTitle = 'Match chat'
    else
      this.chatTitle = changes.chat.currentValue.members[0] == this.userMail ? changes.chat.currentValue.members[1] : changes.chat.currentValue.members[0]

  }

  sendMessage(message){
    if (message.value !== ''){
      this.chat.sendMessage(message.value).subscribe();
      message.value = '';
    }
  }
}
