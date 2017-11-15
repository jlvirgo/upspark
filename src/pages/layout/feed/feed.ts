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

    let loadingPopup = this.loadingCtrl.create({
      spinner: 'crescent',
      content: ''
    });

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

    this.userData = authService.getUserData();
  }

  ngOnInit(){
    this.authService.getUserData().then(
      data => this.userData = data
    );
  }

  eventAvailability(event){
      return _.get(event, 'attending', 0) !== 4;
  }

  getUsersByEmail(emails) {
    emails = _.get(emails, '', '');
    const users = _.map(this.userData, user => {
      console.log(emails, user.email)
      if(_.includes(emails, user.email)) {
        console.log('hit')
        return user.name;
      }
    })
    console.log(users)
    return users;
  }
}
