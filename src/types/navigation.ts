export interface RootStackParamList {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
}

export type NavigationProp = {
  navigate: (screen: keyof RootStackParamList, params?: any) => void;
  goBack: () => void;
}; 