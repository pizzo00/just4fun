import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {io, Socket} from "socket.io-client";
import { UserService } from "./user.service";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class SocketioService {
  private socket;
  constructor( private userService: UserService ) { }

  connect(): Observable< any > {

    this.socket = io(environment.serverUrl);

    this.socket.emit('join', this.userService.mail);

    return new Observable( (observer) => {
      this.socket.on('broadcast', (m) => {
        console.log('Socket.io message received: ' + JSON.stringify(m) );
        observer.next( m );
      });

      this.socket.on('error', (err) => {
        console.log('Socket.io error: ' + err );
        observer.error( err );
      });

      return { unsubscribe() {
          this.socket.disconnect();
      }};

    });
  }
}

/*
  private socket: Socket;

  private constructor() { }

  getSocket(): Socket {
    if (this.socket === null) {
      this.socket = io(environment.serverUrl);
    }
    return this.socket;
  }*/

/*
connect(): Observable<any> {

  this.socket = io(environment.serverUrl);

  return new Observable((observer) => {
    this.socket.join(UserService.prototype.username)

    this.socket.on('broadcast', (message) => {
      console.log(colors.cyan('Socket.io: ' + UserService.prototype.username + ' has recived a new message: ' + JSON.stringify(message.subject)));
      observer.next(message);
    });

    this.socket.on('error', (error) => {
      console.log('Socket.io error: ' + error);
      observer.error(error);
    });
  });
}
 */
