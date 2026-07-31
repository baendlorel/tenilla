# 日志工具重构计划

## 背景
当前logger直接对整个entry对象序列化，导致日志内容过大且冗余。需要优化以减少数据库压力。

## 需求分解

### 1. 字段级别序列化
- 遍历entry的所有字段
- 对每个字段分别使用stringify进行序列化
- 保存序列化后的字符串值

### 2. 长度控制（总长度不超过2000）
- 计算所有序列化后字符串的总长度
- 如果超过2000字符：
  - 找到最长的字符串
  - 删减该字符串，使总长度正好等于2000
  - 如果删减后仍超过，继续删减次长的（递归处理）

### 3. 控制台输出
- 将处理后的序列化对象用console.log输出

### 4. 数据库写入
- 将处理后的对象作为message字段写入数据库

### 5. timestamp字段新增
- 为app.tht_logs表添加timestamp字段
- 将entry.timestamp写入该字段

### 6. message字段优化
- message字段不包含：ip, level, url, staff_code, timestamp
- 这些字段单独存储，避免冗余

## 实现步骤

### Step 1: 修改数据库表结构
执行SQL添加timestamp字段：
```sql
ALTER TABLE app.tht_logs ADD COLUMN IF NOT EXISTS timestamp timestamp;
```

### Step 2: 重写logger.ts逻辑
```typescript
export const logger = defineFluxionLogger((entry) => {
  // 1. 创建entry的副本
  const entryCopy = { ...entry };

  // 2. 提取需要单独存储的字段
  const { ip, level, url, staff_code, timestamp } = entryCopy;

  // 3. 创建message对象（排除单独存储的字段）
  const messageObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(entryCopy)) {
    if (!['ip', 'level', 'url', 'staff_code', 'timestamp'].includes(key)) {
      messageObj[key] = value;
    }
  }

  // 4. 对messageObj的每个字段分别序列化
  const serialized: Record<string, string> = {};
  let totalLength = 0;
  for (const [key, value] of Object.entries(messageObj)) {
    const str = stringify(value);
    serialized[key] = str;
    totalLength += str.length;
  }

  // 5. 长度控制：删减最长的字符串直到总长度=2000
  const MAX_LENGTH = 2000;
  while (totalLength > MAX_LENGTH && Object.keys(serialized).length > 0) {
    // 找到最长的字符串
    let longestKey = '';
    let maxLength = 0;
    for (const [key, str] of Object.entries(serialized)) {
      if (str.length > maxLength) {
        maxLength = str.length;
        longestKey = key;
      }
    }

    if (longestKey === '') break;

    // 计算需要删减的长度
    const excess = totalLength - MAX_LENGTH;
    const neededReduction = Math.min(excess, serialized[longestKey].length - 1);

    // 删减最长的字符串
    serialized[longestKey] = serialized[longestKey].slice(0, serialized[longestKey].length - neededReduction);

    // 更新总长度
    totalLength -= neededReduction;
  }

  // 6. console.log结果
  console.log('[LOG]', serialized);

  // 7. 写入数据库
  const msg = stringify(serialized);
  pg.db162
    .query(
      `
      insert into app.tht_logs (ip, level, url, message, staff_code, timestamp)
      values ($1, $2, $3, $4, $5, $6)
    `,
      [ip ?? null, level ?? null, url ?? null, msg, staff_code ?? null, timestamp ?? null],
    )
    .catch(console.error);
});
```

## 技术细节

- **stringify导入**: 已使用fast-json-stable-stringify
- **数据库**: 使用pg.db162
- **字段提取**: 使用解构赋值提取单独存储的字段
- **长度控制算法**: 循环删减最长的字符串
- **并发安全**: 数据库写入使用.catch处理错误

## 测试考虑

需要测试：
1. 日志总长度<2000时的正常写入
2. 日志总长度>2000时的截断逻辑
3. timestamp字段是否正确写入
4. message字段是否排除了指定字段
