import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { dirtyCheck } from './utils';

@Component({
  selector: 'nz-demo-drawer-size',
  template: `
  <form [formGroup]="settings" nz-form class="container">
  <nz-form-item>
    <input
      nz-input
      placeholder="Name"
      formControlName="settingOne"
      data-cy="input"
    />
  </nz-form-item>



  <nz-form-item>
    <nz-select
      nzShowSearch
      nzAllowClear
      nzPlaceHolder="Select something"
      formControlName="settingTwo"
      data-cy="select"
    >
      <nz-option nzLabel="Jack" nzValue="jack"></nz-option>
      <nz-option nzLabel="Lucy" nzValue="lucy"></nz-option>
      <nz-option nzLabel="Tom" nzValue="tom"></nz-option>
    </nz-select>
  </nz-form-item>

  <nz-form-item>
    <label nz-checkbox formControlName="settingThree" data-cy="checkbox"
      >Checkbox</label
    >
  </nz-form-item>

  <button
    nz-button
    nzType="primary"
    data-cy="saveBtn"
    (click)="submit()"
    *ngIf="isDirty$ | async"
  >
    Save
  </button>
</form>

    <nz-space>
      <button *nzSpaceItem nz-button nzType="primary" (click)="open()">Open Default Size (378px)</button>
      <button *nzSpaceItem nz-button nzType="primary" (click)="showLarge()">Open Large Size (736px)</button>
    </nz-space>

   
  `,
})
export class NzDemoDrawerSizeComponent implements OnInit {
  isDirty$: Observable<boolean>;
  value: string;

  constructor(
    private modalService: NzModalService,
    private drawerService: NzDrawerService
  ) {}

  ngOnInit(): void {
    this.isDirty$ = this.settings.valueChanges.pipe(dirtyCheck(this.store));
  }

  store = new BehaviorSubject({
    settingOne: 'demo',
    settingTwo: 'jack',
    settingThree: true,
  });

  settings = new FormGroup({
    settingOne: new FormControl(null),
    settingTwo: new FormControl(null),
    settingThree: new FormControl(true),
  });
  visible = false;
  size: 'large' | 'default' = 'default';

  get title(): string {
    return `${this.size} Drawer`;
  }

  showDefault(): void {
    this.size = 'default';
    this.open();
  }

  showLarge(): void {
    this.size = 'large';
    this.open();
  }

  open(): void {
    const drawerRef = this.drawerService.create<
      NzDrawerCustomComponent,
      { value: string },
      string
    >({
      nzTitle: 'Component',
      nzFooter: 'Footer',
      nzExtra: 'Extra',
      nzContent: NzDrawerCustomComponent,
      nzContentParams: {
        value: 'this.value',
      },
      nzOnCancel: this.OnCancel,
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe((data) => {
      console.log(data);
      if (typeof data === 'string') {
        this.value = data;
      }
    });

    // drawerRef.can;
  }

  // close(): void {
  //   this.visible = false;
  // }

  OnCancel = () => {
    debugger;
    console.log('inside');
    return this.isDirty$
      .pipe(
        switchMap((dirty) => {
          if (dirty === false) {
            return of(true);
          }

          let navigate;
          return this.modalService
            .confirm({
              nzTitle: 'Confirm',
              nzContent:
                'You have unsaved changes. Are you sure you want to leave?',
              nzOkText: 'Stay',
              nzCancelText: 'Leave',
              nzOnOk() {
                navigate = false;
              },
              nzOnCancel() {
                navigate = true;
              },
            })
            .afterClose.pipe(map(() => navigate));
        }),
        take(1)
      )
      .toPromise();
  };
}

@Component({
  selector: 'nz-drawer-custom-component',
  template: `
    <div>
      <input nz-input  />
     
      <button nzType="primary" (click)="close()" nz-button>Confirm</button>
    </div>
  `,
})
export class NzDrawerCustomComponent {
  @Input() value = '';

  constructor(private drawerRef: NzDrawerRef<string>) {
    // drawerRef.beforeVisibleChange.subscribe(this.onBeforeVisibleChange.bind(this));
  }

  close(): void {
    this.drawerRef.close(this.value);
  }

  // onBeforeVisibleChange(visible: boolean) {
  //   if (!visible) {
  //     // Perform any necessary checks here
  //     if (this.isFormDirty()) {
  //       // Show a confirmation dialog
  //       if (confirm('Are you sure you want to discard the changes?')) {
  //         // Close the drawer
  //         this.drawerRef.close();
  //       }
  //     } else {
  //       // Close the drawer
  //       this.drawerRef.close();
  //     }
  //   }
  // }

  // this.drawerRef.
}
