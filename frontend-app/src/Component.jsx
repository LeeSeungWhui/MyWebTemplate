import { View, ScrollView } from 'react-native';
import DataClassDocs from './docs/components/DataClassDocs';
import ButtonDocs from './docs/components/ButtonDocs';
import IconDocs from './docs/components/IconDocs';
import InputDocs from './docs/components/InputDocs';
import TextareaDocs from './docs/components/TextareaDocs';
import SelectDocs from './docs/components/SelectDocs';
import CheckboxDocs from './docs/components/CheckboxDocs';
import CheckButtonDocs from './docs/components/CheckButtonDocs';
import RadioboxDocs from './docs/components/RadioboxDocs';
import RadioButtonDocs from './docs/components/RadioButtonDocs';
import SwitchDocs from './docs/components/SwitchDocs';
import NumberInputDocs from './docs/components/NumberInputDocs';
import DateTimeDocs from './docs/components/DateTimeDocs';
import ComboboxDocs from './docs/components/ComboboxDocs';
import DropdownDocs from './docs/components/DropdownDocs';
import LoadingDocs from './docs/components/LoadingDocs';
import AlertDocs from './docs/components/AlertDocs';
import ConfirmDocs from './docs/components/ConfirmDocs';
import ToastDocs from './docs/components/ToastDocs';
import TooltipDocs from './docs/components/TooltipDocs';

const Component = () => {
  return (
    <View className="flex-1">
      <ScrollView className="flex-1">
        <View className="p-4 space-y-8">
          <DataClassDocs />
          <ButtonDocs />
          <IconDocs />
          <InputDocs />
          <TextareaDocs />
          <SelectDocs />
          <CheckboxDocs />
          <CheckButtonDocs />
          <RadioboxDocs />
          <RadioButtonDocs />
          <SwitchDocs />
          <NumberInputDocs />
          <DateTimeDocs />
          <ComboboxDocs />
          <DropdownDocs />
          <LoadingDocs />
          <AlertDocs />
          <ConfirmDocs />
          <ToastDocs />
          <TooltipDocs />
        </View>
      </ScrollView>
    </View>
  );
};

export default Component;
