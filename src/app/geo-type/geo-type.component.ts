import { Component, OnInit,Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-geo-type',
  templateUrl: './geo-type.component.html',
  styleUrls: ['./geo-type.component.css']
})
export class GeoTypeComponent implements OnInit {

  @Output() selectionCompletedType = new EventEmitter<any>();

  typeSelect;
  types = [];

  constructor() { }

  ngOnInit() {
    this.loadTypesSelect();
  }

  public loadTypesSelect(){
    this.types = [
      {
        value: "art_gallery",
        name: "Art Galleries"
      },
      {
        value: "bar",
        name: "Bars"
      },
      {
        value: "book_store",
        name: "Book Stores"
      },
      {
        value: "church",
        name: "Churches"
      },
      {
        value: "night_club",
        name: "Night Clubs"
      },
      {
        value: "movie_theater",
        name: "Movie Theathers"
      },
      {
        value: "museums",
        name: "Museums"
      }
    ];
    this.typeSelect = this.types[1].name;
  }

  public getType(type){
    this.typeSelect = type;
    this.selectionCompletedType.emit(this.typeSelect)
  }
}
