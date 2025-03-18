import { AuthService } from "../services/auth-service.js";
import { UserService } from "../services/user-service.js";
import { EvaluationService } from "../services/evaluation-service.js";
import { createUserRepository, createProfileRepository } from "./repository-factory.js";

/**
 * 認証サービスの作成
 */
export function createAuthService(): AuthService {
  const userRepository = createUserRepository();
  return new AuthService(userRepository);
}

/**
 * ユーザーサービスの作成
 */
export function createUserService(): UserService {
  const userRepository = createUserRepository();
  const profileRepository = createProfileRepository();
  return new UserService(userRepository, profileRepository);
}

/**
 * 評価サービスの作成
 */
export function createEvaluationService(): EvaluationService {
  // TODO: 評価リポジトリの実装後に追加
  const evaluationRepository = {} as any; // 仮実装
  const profileRepository = createProfileRepository();
  return new EvaluationService(evaluationRepository, profileRepository);
}
