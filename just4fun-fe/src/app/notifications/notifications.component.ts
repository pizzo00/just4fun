import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {UserService} from "../services/user.service";
import {MatchService} from "../services/match.service";
import {SocketioService} from "../services/socketio.service";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications;
  friendRequests;
  matchInvites;
  acceptedSuccess = false;
  lastMatchAccepted;
  private canAccept = true
  private user;

  constructor(private router: Router, private userService: UserService, private matchService: MatchService,
              private ios: SocketioService) { }

  ngOnInit(): void {
    this.userService.readNotifications().subscribe();
    this.gettingNotifications();
    this.ios.getSocketIO().on('newNotification', (data) =>{
        this.gettingNotifications();
    })
  }

  private gettingNotifications() {
    this.userService.get_user_by_mail(this.userService.email).subscribe(data => {
      this.user = data;
      this.notifications = data.notifications;
      this.notifications.reverse();
      this.notifications.splice(10);
      this.friendRequests = data.friendRequests;
      this.matchInvites = data.matchInvites;
    });
  }

  navigateMessages(chatID){
    this.router.navigate([`/messages?chatID=${chatID}`])
  }

  // accepts/refuses a friend request and deletes it from the array
  handleRequest(isAccepted, requester){
    let idx = this.friendRequests.indexOf(requester);
    this.friendRequests.splice(idx, 1);

    if (isAccepted)
      this.acceptRequest(requester);
    else
      this.refuseRequest(requester);

  }
  acceptRequest(accepted){
    if (this.canAccept){
      this.canAccept = false;
      this.userService.acceptFriendRequest(accepted).subscribe(() => {
      },()=>{}, ()=>{
        this.canAccept = true;
      });
    }
  }
  refuseRequest(refused){
    this.canAccept = false;
    this.userService.refuseFriendRequest(refused).subscribe(() => {
    }, ()=>{}, ()=>{
      this.canAccept = true;
    });
  }

  // accepts/refuses a match invite and deletes it from the array
  handleInvite(isAccepted, sender){
    let idx = this.matchInvites.indexOf(sender);
    this.matchInvites.splice(idx, 1);

    if (isAccepted)
      this.acceptInvite(sender);
    else
      this.refuseInvite(sender);
  }
  acceptInvite(sender){
    console.log("Accepting")
    if (this.canAccept){
      this.canAccept = false;
      this.matchService.crateMatchFromInvitation(this.user.email, sender).subscribe(res => {
          this.lastMatchAccepted = res.matchID;
        },
        ()=>{},
        ()=>{
          this.acceptedSuccess = true;
          setTimeout(()=>{
            this.acceptedSuccess = false;
          }, 7000);
          this.canAccept = true;
        });
    }
    this.userService.deleteInvitation(sender).subscribe();
  }
  refuseInvite(sender){
    this.userService.deleteInvitation(sender).subscribe();
  }

}
