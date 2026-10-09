# Nameof Examples

Use these snippets for strongly typed name extraction patterns that remain safe during refactors.

## `nameof`

```typescript
import { nameof } from '@3sixty/nameof';

class AccountState {
  public id!: string;
}

nameof<AccountState>(); // 'AccountState'
```

```typescript
import { nameof } from '@3sixty/nameof';

interface Profile {
  displayName: string;
  stats?: {
    loginCount: number;
  };
}

const profile: Profile = {
  displayName: 'Ari',
  stats: {
    loginCount: 12
  }
};

nameof(profile.displayName); // 'displayName'
nameof(profile.stats?.loginCount); // 'stats.loginCount'
```

## `nameofKebabCase`

```typescript
import { nameofKebabCase } from '@3sixty/nameof';

class ReportSummary {
  public totalCount!: number;
}

nameofKebabCase<ReportSummary>(); // 'report-summary'
```

## `nameofCamelCase`

```typescript
import { nameofCamelCase } from '@3sixty/nameof';

class UserProfileRecord {
  public profileImageUrl!: string;
}

nameofCamelCase<UserProfileRecord>(); // 'userProfileRecord'
```
