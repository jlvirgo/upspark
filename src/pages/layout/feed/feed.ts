import { Component  } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController , LoadingController} from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable} from 'angularfire2/database';
import { AuthData } from '../../../providers/auth-data';
import 'rxjs/add/operator/map'; // you might need to import this, or not depends on your setup
import _ from 'lodash';

@IonicPage()
@Component({
  selector: 'page-feed',
  templateUrl: 'feed.html'
})

export class FeedPage {

  userEvent: FirebaseListObservable<any[]>;
  availableEvents: FirebaseListObservable<any[]>;
  userData: any;

  feedView: string = "activity";

  constructor(public authService: AuthData, public navCtrl: NavController, public navParams: NavParams ,public modalCtrl: ModalController,public loadingCtrl: LoadingController, public afDB: AngularFireDatabase) {


    this.availableEvents = <FirebaseListObservable<any[]>> afDB.list('/events');

    //loadingPopup.present();
    // this.userEvent = <FirebaseListObservable<any[]>> afDB.list('/events').map((events) => {
    //     return events.map((events) => {
    //       const members = afDB.list('/event/'+events.$key+'/members');
    //      // console.log(members);
    //       loadingPopup.dismiss().catch(() => console.log('ERROR CATCH: LoadingController dismiss'));
    //       return events
    //     })
    //   })

    //this.userData = authService.getUserData();
  }

  ngOnInit(){
    this.authService.getUserData().then(
      data => this.userData = data
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
    console.log(attendees)
     if(attendees !== undefined) {
       var attendeeHTML = '';
    //   console.log(attendees, this.userData)
      _.forEach(this.userData, user => {
        _.forEach(attendees, email => {
          if (email == user.email) {
            attendeeHTML += '<p>' + user.name + ' - ' + user.title + ', ' + user.team + '</p>' +
                '<p>Fun Fact: ' + user.about + '</p> </br>'
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
}
