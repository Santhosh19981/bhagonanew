import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
  chats: any[] = [];

  ngOnInit() {
    this.chats = [
      {
        id: 1,
        name: 'Chef Rajesh',
        avatar: 'assets/Events-Round/Marriage.png',
        role: 'North Indian Specialty Chef',
        lastMessage: 'Sure, I will adjust the spice levels to your preference.',
        time: '12:30 PM',
        unread: 2,
        online: true
      },
      {
        id: 2,
        name: 'Ramesh Catering',
        avatar: 'assets/About-Us/Catering.png',
        role: 'Premium Caterer Vendor',
        lastMessage: 'The welcome drinks menu has been confirmed.',
        time: 'Yesterday',
        unread: 0,
        online: false
      },
      {
        id: 3,
        name: 'Bhagona Customer Support',
        avatar: 'assets/home-logo.png',
        role: 'Live Agent',
        lastMessage: 'How can we help you plan your event today?',
        time: '2 days ago',
        unread: 0,
        online: true
      }
    ];
  }
}
