# Nameof Examples

These examples show strongly typed name extraction patterns that remain safe during refactors.

## `nameof`

```typescript
import { nameof } from '@twin.org/nameof';

class AccountState {
  public id!: string;
}

nameof<AccountState>(); // 'AccountState'
```

```typescript
import { nameof } from '@twin.org/nameof';

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
import { nameofKebabCase } from '@twin.org/nameof';

class ReportSummary {
  public totalCount!: number;
}

nameofKebabCase<ReportSummary>(); // 'report-summary'
```

## `nameofCamelCase`

```typescript
import { nameofCamelCase } from '@twin.org/nameof';

class UserProfileRecord {
  public profileImageUrl!: string;
}

nameofCamelCase<UserProfileRecord>(); // 'userProfileRecord'
```
