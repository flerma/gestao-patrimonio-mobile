// Estende o app.json com a configuração do login com Google.
//
// O config plugin do @react-native-google-signin/google-signin, sem opções,
// exige os arquivos do Firebase (google-services.json / GoogleService-Info.plist),
// que este projeto não usa. Por isso ele é aplicado aqui, com `iosUrlScheme`
// (o client ID iOS invertido), e só quando EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
// estiver definido. No Android não há plugin a aplicar: basta o módulo nativo
// (autolinking) + o client "Android" cadastrado no Google Cloud com o pacote
// e o SHA-1 do certificado de assinatura.
//
// Ambiente: APP_ENV ("development" | "production") vem do perfil do eas.json
// (builds) ou dos scripts `start` / `start:prod` (package.json) e fica em
// `extra.appEnv` — lido por src/lib/config.ts.
module.exports = ({ config: base }) => {
  const config = {
    ...base,
    extra: { ...base.extra, appEnv: process.env.APP_ENV || "development" },
  };

  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (!iosClientId) return config;

  const iosUrlScheme = `com.googleusercontent.apps.${iosClientId.replace(
    /\.apps\.googleusercontent\.com$/,
    "",
  )}`;
  return {
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      ["@react-native-google-signin/google-signin", { iosUrlScheme }],
    ],
  };
};
