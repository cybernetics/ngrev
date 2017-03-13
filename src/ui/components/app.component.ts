import { Component, NgZone } from '@angular/core';
import { ProjectProxy } from '../model/project-proxy';
import { Network } from 'vis';
import { ContextSymbols } from 'ngast';
import { StateProxy } from '../states/state-proxy';
import { VisualizationConfig, Metadata } from '../../shared/data-format';

@Component({
  selector: 'ngrev-app',
  template: `
    <button (click)="prevState()">Back</button>
    <ngrev-home *ngIf="!state.active" (project)="onProject($event)"></ngrev-home>
    <ngrev-visualizer
      *ngIf="state.active"
      [data]="currentData"
      [metadata]="currentMetadata"
      (select)="tryChangeState($event)"
      (highlight)="updateMetadata($event)"
    >
    </ngrev-visualizer>
  `,
  styles: [`
    :host {
      width: 100%;
      height: 100%;
      display: block;
    }

    button {
      top: 0;
      left: 0;
      position: absolute;
      z-index: 1;
      width: 60px;
      height: 30px;
      background: #eee;
      border: none;
      outline: none;
      border-bottom-right-radius: 7px;
    }

    button:active {
      background: #ccc;
    }
  `]
})
export class AppComponent {
  currentMetadata: Metadata;
  currentData: VisualizationConfig<any>;

  constructor(private ngZone: NgZone, private project: ProjectProxy, public state: StateProxy) {}

  ngAfterViewInit() {
    this.onProject('/Users/mgechev/Projects/angular-seed/src/client/tsconfig.json');
  }

  tryChangeState(nodeId: string) {
    this.state.nextState(nodeId)
      .then(() => this.updateNewState());
  }

  updateMetadata(nodeId: string) {
    this.currentMetadata = null;
    this.state.getMetadata(nodeId)
    .then((metadata: Metadata) => {
      this.currentMetadata = metadata;
    });
  }

  onProject(tsconfig: string) {
    this.ngZone.run(() => {
      this.project.load(tsconfig)
        .then((rootContext: ContextSymbols) => this.state = new StateProxy())
        .then((proxy: StateProxy) => proxy.getData())
        .then(data => this.currentData = data);
    });
  }

  prevState() {
    this.currentMetadata = null;
    this.state.prevState().then(() => this.updateNewState());
  }

  private updateNewState() {
    this.currentMetadata = null;
    this.state.getData()
      .then(data => this.currentData = data);
  }
}