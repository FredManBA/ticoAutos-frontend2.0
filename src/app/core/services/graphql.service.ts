import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface GraphQLResponse<T> {
  data: T;
  errors?: { message: string }[];
}

@Injectable({ providedIn: 'root' })
export class GraphQLService {
  private http = inject(HttpClient);
  private readonly GRAPHQL_URL = 'http://localhost:5268/graphql';

  query<T>(query: string, variables?: Record<string, unknown>): Observable<T> {
    return this.http
      .post<GraphQLResponse<T>>(this.GRAPHQL_URL, { query, variables })
      .pipe(
        map((res) => {
          if (res.errors?.length) {
            const err = res.errors[0];
            const detail = (err as any).extensions?.message ?? err.message;
            console.error('[GraphQL raw error]', JSON.stringify(res.errors, null, 2));
            throw new Error(detail);
          }
          return res.data;
        })
      );
  }
}
