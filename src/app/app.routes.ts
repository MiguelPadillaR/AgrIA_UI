import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { ParcelFinderComponent } from './components/parcel-finder/parcel-finder.component';

export const routes: Routes = [
    {
        path: "chat",
        component: ChatComponent,
        title: "AgrIA"
    },
    {
        path: "parcel-finder",
        component: ParcelFinderComponent,
        title: "Parcel Finder"
    },
    
];
