import {
  Component, OnInit, NgModule,
} from '@angular/core';

import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import { DxPieChartModule } from 'devextreme-angular/ui/pie-chart';
import { DxChartModule } from 'devextreme-angular/ui/chart';
import { DxRangeSelectorModule } from 'devextreme-angular/ui/range-selector';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxDropDownButtonModule } from 'devextreme-angular/ui/drop-down-button';

import { SelectionChangedEvent } from 'devextreme/ui/drop_down_button';

import { CommonModule, formatDate } from '@angular/common';
import { DataService } from 'src/app/services';
import { Observable, forkJoin } from 'rxjs';

import { CardAnalyticsModule } from 'src/app/components/card-analytics/card-analytics.component';
import { ToolbarAnalyticsModule } from 'src/app/components/toolbar-analytics/toolbar-analytics.component';

import { analyticsPanelItems } from 'src/app/types/resource';

import { Sales, SalesOrOpportunitiesByCategory } from 'src/app/types/analytics';
import { DxLoadPanelModule } from "devextreme-angular/ui/load-panel";
import { ApplyPipeModule } from "../../pipes/apply.pipe";

@Component({
  templateUrl: './analytics-sales-report.component.html',
  styleUrls: ['./analytics-sales-report.component.scss'],
  providers: [DataService],
})
export class AnalyticsSalesReportComponent implements OnInit {
  groupByPeriods = ['Day', 'Month'];

  sales: Sales = null;
  salesByCategory: SalesOrOpportunitiesByCategory = null;
  salesByDateAndCategory: SalesOrOpportunitiesByCategory = null;

  visualRange: unknown = {};

  isLoading: boolean = true;

  constructor(private service: DataService) { }

  selectionChange({item: period}: SelectionChangedEvent) {
    this.isLoading = true;
    this.service.getSalesByOrderDate(period.toLowerCase())
      .subscribe((data) => {
        this.salesByDateAndCategory = data;
        this.isLoading = false;
    })
  }

  onRangeChanged = ({value: dates}) => {
    this.isLoading = true;
    const [startDate, endDate] = dates.map((date) => formatDate(date, 'YYYY-MM-dd', 'en'));

    this.service.getSalesByCategory(startDate, endDate).subscribe((data) => {
      this.salesByCategory = data;
      this.isLoading = false;
    });
  };

  customizeSaleText(arg: { percentText: string }) {
    return arg.percentText;
  }

  loadData = (groupBy: string) => {
    const tasks: Observable<any>[] = [];
    const [startDate, endDate] = analyticsPanelItems[4].value.split('/');
    [
      ['sales', this.service.getSales(startDate, endDate)],
      ['salesByDateAndCategory', this.service.getSalesByOrderDate(groupBy)],
    ].forEach(([dataName, loader]: [string, Observable<any>]) => {
        tasks.push(loader);
        loader.subscribe((data) => this[dataName] = data);
      }
    );
    forkJoin(tasks).subscribe(() => {
      this.isLoading = false;
    });
  };

  customiseToolip({ seriesName }) {
    return { text: seriesName };
  }

  ngOnInit(): void {
    this.loadData(this.groupByPeriods[1].toLowerCase());
  }
}

@NgModule({
  imports: [
    DxLoadPanelModule,
    DxButtonModule,
    DxToolbarModule,
    DxPieChartModule,
    DxChartModule,
    DxDropDownButtonModule,
    DxRangeSelectorModule,
    CardAnalyticsModule,
    ToolbarAnalyticsModule,
    ApplyPipeModule,
    CommonModule,
  ],
  providers: [],
  exports: [],
  declarations: [AnalyticsSalesReportComponent],
})
export class AnalyticsSalesReportModule { }
