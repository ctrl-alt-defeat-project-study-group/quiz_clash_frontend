import React, { useId } from 'react';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';

interface SettingToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
  style?: React.CSSProperties;
}

export const SettingToggleRow: React.FC<SettingToggleRowProps> = ({
  label,
  description,
  checked,
  onToggle,
  style,
}) => {
  const switchId = useId();

  return (
    <div style={style} className="mt-2.5 first:mt-0">
      <FieldLabel
        htmlFor={switchId}
        className="w-full cursor-pointer select-none bg-card transition-colors hover:border-primary"
      >
        <Field orientation="horizontal" className="!py-2.5 !px-3.5">
          <FieldContent>
            <FieldTitle>{label}</FieldTitle>
            <FieldDescription>{description}</FieldDescription>
          </FieldContent>
          <Switch
            id={switchId}
            checked={checked}
            onCheckedChange={() => onToggle()}
          />
        </Field>
      </FieldLabel>
    </div>
  );
};
