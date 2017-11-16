import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database';
import md5 from 'crypto-md5'; // dependencies:"crypto-md5"
import _ from 'lodash';

@Injectable()
export class AuthData {
  authState: any = null;
  email: any = null;
  profilePicture: any = null;
  profileArray : any=[];
  profile: FirebaseObjectObservable<any[]>;
  uid: any = null;
  users: any;

  constructor(public afAuth: AngularFireAuth,  public afDb: AngularFireDatabase) {
    this.afAuth.authState.subscribe((auth) => {
      if(auth) {
        this.authState = auth;
        this.uid = auth.uid;
        this.email = auth.email;
        this.profilePicture = "https://www.gravatar.com/avatar/" + md5(this.email.toLowerCase(), 'hex');
        this.profile = this.afDb.object('/userProfile/'+this.uid );
        this.users = this.afDb.object('/userProfile/');
        this.profile.subscribe(profile => {
          this.profileArray = profile;
        })
      }
    });
  }

  get authenticated(): boolean {
    return this.authState !== null;
  }

  get userProfile(): any {
    return this.profile;
  }

  get userProfilePicture(): string {
    return this.profilePicture;
  }

  getUserData():firebase.Promise<any> {
    return firebase.database().ref('/userProfile').once('value').then((users) => {
      return users.val()
    });
  }

  getCurrentUserByUid(uid: string):firebase.Promise<any> {
    return firebase.database().ref('/userProfile/'+ uid ).once('value').then((user) => {
      return user.val()
    });
  }

  setEventAttendance(event: any, email: string) {
    var attendees = _.get(event, 'attending', [email]);
    if(!attendees[email]) {
      attendees.push(email);
    }
    console.log(event.attending, email)
    firebase.database().ref('/meetup/' + event.$key)
      .update( { attending: attendees } );
  }

  loginUser(newEmail: string, newPassword: string): firebase.Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(newEmail,newPassword)
  }

  resetPassword(email: string): firebase.Promise<any> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser(): firebase.Promise<any> {
    return this.afAuth.auth.signOut();
  }

  registerUser(name: string, email: string, password: string, about: string, interests: any, title: string, team: string ): firebase.Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password).then((newUser) => {
      firebase.database().ref('/userProfile').child(newUser.uid).set({
          email: email,
          name: name,
          about: about,
          interests: interests,
          title: title,
          team: team
      });
    });
  }

}

