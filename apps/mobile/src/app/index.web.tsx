import { Redirect } from "expo-router";

export default function IndexWebRoute() {
    return <Redirect href="/(app)/(auth)/sign-in" />
}
