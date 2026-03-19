import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ModalService, ModalConfig, FormField } from '../core/modal.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  config: ModalConfig | null = null;
  form: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private modalService: ModalService,
    private fb: FormBuilder,
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.modalService.isOpen.pipe(takeUntil(this.destroy$)).subscribe((isOpen) => {
      this.isOpen = isOpen;
    });

    this.modalService.config.pipe(takeUntil(this.destroy$)).subscribe((config) => {
      this.config = config;
      if (config) {
        this.buildForm(config.fields);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(fields: FormField[]): void {
    const group: Record<string, any> = {};
    fields.forEach((field) => {
      const validators = field.required ? [Validators.required] : [];
      if (field.type === 'number') {
        if (field.min != null) validators.push(Validators.min(field.min));
        if (field.max != null) validators.push(Validators.max(field.max));
      }
      group[field.name] = [field.value ?? '', validators];
    });
    this.form = this.fb.group(group);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const values = this.form.getRawValue();
    if (this.config?.onSubmit) {
      this.config.onSubmit(values);
    }
  }

  onCancel(): void {
    if (this.config?.onCancel) {
      this.config.onCancel();
    }
    this.modalService.close();
  }

  getFieldType(field: FormField): string {
    return field.type;
  }

  get fields(): FormField[] {
    return this.config?.fields ?? [];
  }

  get submitLabel(): string {
    return this.config?.submitLabel ?? 'Aceptar';
  }

  get cancelLabel(): string {
    return this.config?.cancelLabel ?? 'Cancelar';
  }
}
