import { Redirect } from 'expo-router';

export default function RedirectToAuth() {
  return <Redirect href={{ pathname: "./(loginscreen)/login" }} />;
}