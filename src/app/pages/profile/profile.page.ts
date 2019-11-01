import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  mainuser: AngularFirestoreDocument
	userPosts
	sub
	posts
	username: string
	profilePic: string

  constructor(
    private afs: AngularFirestore,
    private user: AuthService,
    private router: Router
    ) {
    const posts = afs.doc('users/${user.getUID()}')
    
    this.mainuser = afs.doc(`users/${user.getUID()}`)
		this.sub = this.mainuser.valueChanges().subscribe(event => {
			this.posts = event.posts
			this.username = event.username
			this.profilePic = event.profilePic
		})
   }

   ngOnDestroy() {
		this.sub.unsubscribe()
	}

  ngOnInit() {

  }

  goTo(postID: string) {
		this.router.navigate(['/tabs/post/' + postID.split('/')[0]])
	}

}
