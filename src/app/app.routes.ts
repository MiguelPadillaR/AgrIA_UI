import { Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { ParcelFinderComponent } from './parcel-finder/parcel-finder.component';

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
