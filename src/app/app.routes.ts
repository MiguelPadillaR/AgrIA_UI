import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { ParcelFinderComponent } from './components/parcel-finder/parcel-finder.component';
import { HomePageComponent } from './components/home-page/home-page.component';
import { HelpGuideComponent } from './components/help-guide/help-guide.component';

export const routes: Routes = [
    {
        path: "",
        component: HomePageComponent,
        title: "Home"
    },
{
        path: "parcel-finder",
        component: ParcelFinderComponent,
        title: "Parcel Finder"
    },
    {
        path: "chat",
        component: ChatComponent,
        title: "AgrIA"
    },
    {
        path: "help",
        component: HelpGuideComponent,
        title: "Help"
    },


    
];
