import { Injectable } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
@Injectable()
export class HttpService {
  baseUrl: string;
  constructor(private http: HttpClient) {
    this.baseUrl = "https://en.wikipedia.org/w/api.php?";
  }

  request(url: string, method: string, text: string): Promise<Response> {
    return fetch(url, { method, mode: "cors" }).then((response) =>
      response.json()
    );
  }
}
