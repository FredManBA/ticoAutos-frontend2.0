import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { GraphQLService } from '../../../core/services/graphql.service';
import { Vehicle } from '../../../core/models/vehicle.models';
import { VehicleQuestionsComponent } from '../vehicle-questions/vehicle-questions.component';

const GET_VEHICLE = `
  query GetVehicle($id: Int!) {
    vehicle(id: $id) {
      id brand model year price description imageUrl
      isSold ownerId ownerName createdAt unansweredQuestions
      questions {
        id content createdAt vehicleId askerId askerName
        answer { id content createdAt }
      }
    }
  }
`;

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, VehicleQuestionsComponent],
  templateUrl: './vehicle-detail.component.html'
})
export class VehicleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private graphql = inject(GraphQLService);

  vehicle: Vehicle | null = null;
  loading = true;
  urlCopied = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.graphql.query<{ vehicle: Vehicle }>(GET_VEHICLE, { id }).subscribe({
      next: (data) => {
        this.vehicle = data.vehicle;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  copyUrl(): void {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.urlCopied = true;
      setTimeout(() => (this.urlCopied = false), 2000);
    });
  }
}