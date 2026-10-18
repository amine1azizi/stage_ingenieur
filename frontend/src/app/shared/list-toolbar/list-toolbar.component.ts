import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface ListToolbarOption {
  value: string;
  label: string;
}

export interface ListToolbarFilter {
  key: string;
  label: string;
  options: ListToolbarOption[];
}

export interface ListToolbarChange {
  search: string;
  sortKey: string;
  sortDir: 'asc' | 'desc';
  filters: Record<string, string>;
}

@Component({
  selector: 'app-list-toolbar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './list-toolbar.component.html',
  styleUrl: './list-toolbar.component.scss'
})
export class ListToolbarComponent implements OnInit, OnDestroy {
  private static nextInstanceId = 0;
  readonly instanceId = ++ListToolbarComponent.nextInstanceId;

  @Input() placeholder = 'Search';
  @Input() sortOptions: ListToolbarOption[] = [];
  @Input() initialSortDir: 'asc' | 'desc' = 'asc';
  @Input() filters: ListToolbarFilter[] = [];
  @Input() resultCount = 0;
  @Input() totalCount = 0;
  @Output() change = new EventEmitter<ListToolbarChange>();

  search = '';
  sortKey = '';
  sortDir: 'asc' | 'desc' = 'asc';
  filterValues: Record<string, string> = {};

  private searchTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.sortKey = this.sortOptions[0]?.value ?? '';
    this.sortDir = this.initialSortDir;
    this.resetFilterValues();
    this.emitChange();
  }

  ngOnDestroy(): void {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
  }

  onSearchChange(value: string): void {
    this.search = value;
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => this.emitChange(), 250);
  }

  clearSearch(): void {
    this.onSearchChange('');
  }

  onSortChange(value: string): void {
    this.sortKey = value;
    this.emitChange();
  }

  onFilterChange(key: string, value: string): void {
    this.filterValues = { ...this.filterValues, [key]: value };
    this.emitChange();
  }

  toggleSortDirection(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.emitChange();
  }

  reset(): void {
    this.search = '';
    this.sortKey = this.sortOptions[0]?.value ?? '';
    this.sortDir = 'asc';
    this.resetFilterValues();
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = undefined;
    }
    this.emitChange();
  }

  private resetFilterValues(): void {
    this.filterValues = Object.fromEntries(this.filters.map((filter) => [filter.key, '']));
  }

  private emitChange(): void {
    this.change.emit({
      search: this.search,
      sortKey: this.sortKey,
      sortDir: this.sortDir,
      filters: { ...this.filterValues }
    });
  }
}
