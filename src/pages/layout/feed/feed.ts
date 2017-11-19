import { Component  } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController , LoadingController, ToastController} from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import { AuthData } from '../../../providers/auth-data';
import { AngularFireAuth } from 'angularfire2/auth';
import 'rxjs/add/operator/map'; // you might need to import this, or not depends on your setup
import _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html'
})

export class FeedPage {
  availableEvents: FirebaseListObservable<any[]>;
  userData: any;
  userEmail: string;
  uid: string;

  constructor(public afAuth: AngularFireAuth,
              public authService: AuthData,
              public navCtrl: NavController,
              public navParams: NavParams,
              public modalCtrl: ModalController,
              public loadingCtrl: LoadingController,
              public afDB: AngularFireDatabase,
              private toastCtrl: ToastController
  ) {
    this.availableEvents = <FirebaseListObservable<any[]>> afDB.list('/meetup');

    this.afAuth.authState.subscribe((auth) => {
      if(auth) {
        this.uid = auth.uid;
      }
    });
  }

  ngOnInit(){
    this.authService.getUserData().then(data => this.userData = data);
    this.authService.getCurrentUserByUid(this.uid).then(
      data => {
        console.log(data, this.availableEvents)
        this.userEmail = _.get(data, 'email', undefined);
      }
    );
  }

  eventAvailability(event){
      return _.get(event, 'attending', 0) !== 4;
  }

  toggleInfo(data) {
    if (data.showDetails) {
      data.showDetails = false;
      data.icon = 'add-circle-outline';
    } else {
      data.showDetails = true;
      data.icon = 'remove-circle-outline';
    }
  }

  getEventDetails(attendees) {
     if(attendees !== undefined) {
       var attendeeHTML = '';
      _.forEach(this.userData, user => {
        _.forEach(attendees, email => {
          if (email == _.get(user, 'email', undefined)) {
            attendeeHTML += '<p>' + user.name + ' - ' + user.title + ', ' + user.team + '</br>' +
                'Fun Fact: ' + user.about + '</p> </br>'
          }
        })
      })
     return attendeeHTML;
    } else {
      return '<p>No attendees have joined yet.</p>'
    }
  }

  getNameByEmail(emails) {
    const names = [];
    if(emails !== undefined) {
      // console.log(emails, this.userData)
      _.forEach(this.userData, user => {
        if(_.includes(emails, user.email)) {
          names.push(user.name);
        }
      })
      return names.join(', ');
    } else {
      return ''
    }
  }

  isUserEvent(event) {
    return _.includes(event.members, this.userEmail) || _.includes(event.attending, this.userEmail);
  }

  isAttendingEvent(event) {
    return _.includes(event.attending, this.userEmail);
  }

  joinEvent(event) {
    const toast = this.toastCtrl.create({
      message: "You've joined the event!",
      position: 'bottom',
      duration: 3000
    });
    this.authService.setEventAttendance(event, this.userEmail);
    toast.present();
  }
}



