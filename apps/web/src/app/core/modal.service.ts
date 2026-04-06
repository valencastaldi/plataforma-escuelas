import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum ModalType {
  NOTA_CREATE = 'nota_create',
  NOTA_EDIT = 'nota_edit',
  ASISTENCIA_CREATE = 'asistencia_create',
  ASISTENCIA_EDIT = 'asistencia_edit',
  MENSAJE_CREATE = 'mensaje_create',
}

export interface ModalConfig {
  type: ModalType;
  title: string;
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: (values: Record<string, any>) => void;
  onCancel?: () => void;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'checkbox' | 'textarea' | 'select';
  value?: any;
  required?: boolean;
  options?: { label: string; value: any }[];
  min?: number | null;
  max?: number | null;
  placeholder?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private isOpen$ = new BehaviorSubject<boolean>(false);
  private config$ = new BehaviorSubject<ModalConfig | null>(null);

  get isOpen() {
    return this.isOpen$.asObservable();
  }

  get config() {
    return this.config$.asObservable();
  }

  open(config: ModalConfig): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      const originalOnSubmit = config.onSubmit;
      const originalOnCancel = config.onCancel;

      config.onSubmit = (values: Record<string, any>) => {
        if (originalOnSubmit) originalOnSubmit(values);
        this.close();
        resolve(values);
      };

      config.onCancel = () => {
        if (originalOnCancel) originalOnCancel();
        this.close();
        reject(new Error('Modal cancelled'));
      };

      this.config$.next(config);
      this.isOpen$.next(true);
    });
  }

  close(): void {
    this.isOpen$.next(false);
    this.config$.next(null);
  }
}
