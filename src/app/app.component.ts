import { Component, ElementRef, ViewChild } from "@angular/core";
import { fromEvent } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  tap,
} from "rxjs/operators";
import { HttpService } from "./services/http.service";
import _ from "lodash";
import { FormControl } from "@angular/forms";
import { KeyValue } from "@angular/common";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  @ViewChild("input", { static: true }) input: ElementRef;
  searchFormControl = new FormControl("", []);
  title = "ebay";

  ranking = {};
  loading: boolean = false;
  notFound: boolean = false;

  constructor(private httpService: HttpService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement, "keyup")
      .pipe(
        filter(Boolean),
        debounceTime(500),
        distinctUntilChanged(),
        tap(async () => {
          this.loading = true;
          const data = await this.getWikipediaTopics(
            this.searchFormControl.value
          );
          this.init(data);
        })
      )
      .subscribe();
  }

  async getWikipediaTopics(text: string) {
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=${text}&format=json&origin=*`;

    return this.httpService.request(url, "get", text);
  }

  init(data) {
    this.notFound = false;

    if (data.query && data.query.pages) {
      const [res] = Object.entries(data.query.pages);
      const extract = res[1]["extract"];

      if (extract) {
        const results = this.countWords(extract);

        const groupByCount = this.sortGroups(_.groupBy(results, "count"));
        const rankingGroups = this.rankWords(groupByCount);
        this.ranking = rankingGroups;
      } else {
        this.notFound = true;
      }

      this.loading = false;
    }
  }

  sortGroups(groupByCount) {
    return Object.keys(groupByCount).reduce((acc, group) => {
      const sorted = groupByCount[group].sort((a, b) =>
        a.word.localeCompare(b.word)
      );
      acc[group] = sorted;

      return acc;
    }, {});
  }

  countWords(str: string) {
    const toLowerCase = str.toLowerCase();
    const strippedHtml = toLowerCase.replace(/<[^>]+>/g, "");
    const words = strippedHtml.split(" ");
    const uniqueWords = [...new Set(strippedHtml.split(" "))];

    const results: { word: string; count: number }[] = [];

    uniqueWords.forEach((v) =>
      results.push({ word: v, count: words.filter((c) => c == v).length })
    );

    return results;
  }

  rankWords(groups) {
    let rank = 5;

    return Object.keys(groups)
      .reverse()
      .reduce((acc, groupInd) => {
        if (rank) {
          if (!acc[rank]) {
            acc[rank] = groups[groupInd];
          }

          rank--;
        }

        return acc;
      }, {});
  }

  getKeys(val) {
    return Object.keys(val).reverse();
  }

  ngOnDestroy(): void {}
}
