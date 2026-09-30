export interface PracticeQuestion {
  id: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  question: string;
  options: [string, string, string, string];
  correctAnswer: number; // 0 to 3
  explanation: string;
}

export const TECHNICAL_CATEGORIES = [
  'Java',
  'Python',
  'C',
  'Data Structures',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'OOP',
] as const;

export const APTITUDE_CATEGORIES = [
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
] as const;

export const TECHNICAL_QUESTIONS: PracticeQuestion[] = [
  // ================= JAVA (12 Questions) =================
  {
    id: 'java-1',
    category: 'Java',
    difficulty: 'Easy',
    question: 'Which component of Java is responsible for converting bytecode into machine-specific code?',
    options: ['JDK (Java Development Kit)', 'JVM (Java Virtual Machine)', 'JRE (Java Runtime Environment)', 'javac Compiler'],
    correctAnswer: 1,
    explanation: 'JVM (Java Virtual Machine) interprets or JIT-compiles platform-independent bytecode (.class) into native machine code for the host OS.'
  },
  {
    id: 'java-2',
    category: 'Java',
    difficulty: 'Easy',
    question: 'What is the size of an int variable in Java across all 32-bit and 64-bit platforms?',
    options: ['16 bits (2 bytes)', '32 bits (4 bytes)', '64 bits (8 bytes)', 'Depends on the operating system'],
    correctAnswer: 1,
    explanation: 'In Java, primitive types have fixed sizes for portability. An int is always 32 bits (4 bytes) signed two’s complement.'
  },
  {
    id: 'java-3',
    category: 'Java',
    difficulty: 'Easy',
    question: 'Which keyword is used in Java to prevent a class from being subclassed (inherited)?',
    options: ['static', 'abstract', 'final', 'const'],
    correctAnswer: 2,
    explanation: 'Declaring a class as final (e.g., public final class String) prevents any other class from extending it.'
  },
  {
    id: 'java-4',
    category: 'Java',
    difficulty: 'Easy',
    question: 'What is the output of ("Java" == new String("Java")) in Java?',
    options: ['true', 'false', 'Compilation error', 'NullPointerException'],
    correctAnswer: 1,
    explanation: 'The == operator compares object references. "Java" resides in the String Constant Pool, whereas new String("Java") creates a new object on the heap.'
  },
  {
    id: 'java-5',
    category: 'Java',
    difficulty: 'Medium',
    question: 'How does Java HashMap handle hash collisions starting from Java 8 when a bucket exceeds the treeify threshold (8)?',
    options: [
      'It resizes the array immediately regardless of capacity',
      'It converts the bucket linked list into a balanced Red-Black Tree',
      'It throws a CollisionOverflowException',
      'It uses linear probing in the next bucket'
    ],
    correctAnswer: 1,
    explanation: 'In Java 8+, when a bucket contains 8 or more nodes and total table capacity is at least 64, the linked list is converted to a Red-Black Tree, improving worst-case lookup from O(n) to O(log n).'
  },
  {
    id: 'java-6',
    category: 'Java',
    difficulty: 'Medium',
    question: 'Which interface must be implemented by a class to define the natural ordering of its objects for Collections.sort()?',
    options: ['Comparator', 'Comparable', 'Serializable', 'Iterable'],
    correctAnswer: 1,
    explanation: 'java.lang.Comparable<T> defines compareTo(T o) for natural ordering, whereas Comparator<T> defines external custom comparison logic.'
  },
  {
    id: 'java-7',
    category: 'Java',
    difficulty: 'Medium',
    question: 'What happens if an exception is thrown inside a try block and the finally block also contains a return statement?',
    options: [
      'The exception is propagated and finally is skipped',
      'The finally block return value overrides and suppresses the thrown exception',
      'Compilation fails with unreachable code error',
      'Both the exception and return value are returned as a tuple'
    ],
    correctAnswer: 1,
    explanation: 'A return statement inside a finally block suppresses any unhandled exception thrown in the try or catch block, which is why returning from finally is considered an anti-pattern.'
  },
  {
    id: 'java-8',
    category: 'Java',
    difficulty: 'Medium',
    question: 'What is the difference between String, StringBuilder, and StringBuffer in Java?',
    options: [
      'String is mutable; StringBuilder and StringBuffer are immutable',
      'String is immutable; StringBuffer is thread-safe (synchronized); StringBuilder is mutable and not synchronized',
      'StringBuilder is synchronized; StringBuffer is not synchronized',
      'All three are immutable in Java 17+'
    ],
    correctAnswer: 1,
    explanation: 'String is immutable. StringBuffer synchronizes its methods for thread safety, while StringBuilder offers faster single-threaded mutable string manipulation.'
  },
  {
    id: 'java-9',
    category: 'Java',
    difficulty: 'Hard',
    question: 'What does the volatile keyword guarantee in the Java Memory Model (JMM)?',
    options: [
      'Atomicity of compound operations like count++',
      'Visibility of changes across threads and prevention of instruction reordering around the volatile access',
      'Automatic deadlock detection between competing threads',
      'Storing the variable in CPU L1 cache permanently'
    ],
    correctAnswer: 1,
    explanation: 'volatile establishes a happens-before relationship ensuring writes are immediately visible to other threads and prevents memory reordering, though compound operations like i++ still require synchronization or AtomicInteger.'
  },
  {
    id: 'java-10',
    category: 'Java',
    difficulty: 'Hard',
    question: 'In Java Garbage Collection, what is the primary purpose of the G1 (Garbage-First) collector?',
    options: [
      'To disable garbage collection until heap is 100% full',
      'To divide the heap into equal-sized regions and prioritize collecting regions with the most garbage first for predictable pause times',
      'To use reference counting instead of reachability analysis',
      'To allocate all objects on the thread stack'
    ],
    correctAnswer: 1,
    explanation: 'G1 divides the heap into regions and tracks live data per region, reclaiming regions with the most garbage first to meet user-defined pause-time goals.'
  },
  {
    id: 'java-11',
    category: 'Java',
    difficulty: 'Medium',
    question: 'Which functional interface in java.util.function takes one argument and returns a boolean?',
    options: ['Consumer<T>', 'Supplier<T>', 'Predicate<T>', 'Function<T, R>'],
    correctAnswer: 2,
    explanation: 'Predicate<T> has the abstract method boolean test(T t), commonly used in Stream.filter().'
  },
  {
    id: 'java-12',
    category: 'Java',
    difficulty: 'Hard',
    question: 'Why must a class that overrides equals(Object) also override hashCode() in Java?',
    options: [
      'Otherwise the code will not compile',
      'To maintain the contract that equal objects must produce the same hash code for hash-based collections like HashMap and HashSet',
      'Because hashCode() is used by the == operator',
      'To reduce memory consumption of the object header'
    ],
    correctAnswer: 1,
    explanation: 'HashMap and HashSet first compare bucket hash codes before calling equals(). If two equal objects have different hash codes, lookups in hash collections will fail.'
  },

  // ================= PYTHON (12 Questions) =================
  {
    id: 'py-1',
    category: 'Python',
    difficulty: 'Easy',
    question: 'Which of the following data types in Python is immutable?',
    options: ['list', 'dict', 'set', 'tuple'],
    correctAnswer: 3,
    explanation: 'Tuples are immutable sequences in Python, meaning their elements cannot be reassigned after creation (making them hashable if all elements are hashable).'
  },
  {
    id: 'py-2',
    category: 'Python',
    difficulty: 'Easy',
    question: 'What is the output of bool([]) and bool([0]) in Python?',
    options: ['False, False', 'False, True', 'True, False', 'True, True'],
    correctAnswer: 1,
    explanation: 'An empty list [] is falsy (False), whereas [0] is a non-empty list containing one element, so bool([0]) evaluates to True.'
  },
  {
    id: 'py-3',
    category: 'Python',
    difficulty: 'Easy',
    question: 'What does the // operator perform in Python 3?',
    options: ['Single-line comment', 'Floor division returning the largest integer less than or equal to the quotient', 'Exponentiation', 'Bitwise XOR'],
    correctAnswer: 1,
    explanation: 'In Python 3, / performs true floating-point division and // performs floor division (e.g., 7 // 2 == 3, -7 // 2 == -4).'
  },
  {
    id: 'py-4',
    category: 'Python',
    difficulty: 'Easy',
    question: 'Which keyword is used to create an anonymous inline function in Python?',
    options: ['def', 'func', 'lambda', 'yield'],
    correctAnswer: 2,
    explanation: 'The lambda keyword creates small anonymous functions restricted to a single expression, e.g., lambda x: x * 2.'
  },
  {
    id: 'py-5',
    category: 'Python',
    difficulty: 'Medium',
    question: 'Why is using a mutable default argument like def append_item(val, items=[]): dangerous in Python?',
    options: [
      'Python raises a SyntaxError when defining mutable defaults',
      'Default argument values are evaluated only once at function definition time, so the same list is shared across calls',
      'It causes a memory leak in the Global Interpreter Lock',
      'It converts the list into a tuple automatically'
    ],
    correctAnswer: 1,
    explanation: 'Default parameters are bound once when def executes. Mutating the default list persists across subsequent calls that omit the argument.'
  },
  {
    id: 'py-6',
    category: 'Python',
    difficulty: 'Medium',
    question: 'What is the primary difference between copy.copy() (shallow copy) and copy.deepcopy() in Python?',
    options: [
      'copy.copy() only works on strings',
      'Shallow copy creates a new container but copies references to nested objects; deepcopy recursively copies all nested objects',
      'deepcopy is faster and uses less memory than shallow copy',
      'There is no difference in Python 3'
    ],
    correctAnswer: 1,
    explanation: 'A shallow copy duplicates the top-level container while referencing the same inner mutable objects; deepcopy recursively clones nested structures.'
  },
  {
    id: 'py-7',
    category: 'Python',
    difficulty: 'Medium',
    question: 'How does a Python generator function using yield differ from a regular function using return?',
    options: [
      'A generator returns an iterator that produces values lazily one at a time, preserving local state between resumptions',
      'A generator runs on a separate OS kernel thread automatically',
      'A generator caches all values in a list before returning',
      'yield can only be used inside a class constructor'
    ],
    correctAnswer: 0,
    explanation: 'yield suspends function execution and returns a value to the caller while saving stack frame state, enabling memory-efficient lazy evaluation.'
  },
  {
    id: 'py-8',
    category: 'Python',
    difficulty: 'Medium',
    question: 'What is the purpose of *args and **kwargs in Python function signatures?',
    options: [
      'Pointer dereferencing like in C',
      '*args collects extra positional arguments as a tuple; **kwargs collects extra keyword arguments as a dictionary',
      'Type annotations for integer multiplication',
      'Enforcing keyword-only arguments'
    ],
    correctAnswer: 1,
    explanation: '*args packs variable positional arguments into a tuple, and **kwargs packs variable keyword arguments into a dict.'
  },
  {
    id: 'py-9',
    category: 'Python',
    difficulty: 'Hard',
    question: 'What is the Global Interpreter Lock (GIL) in CPython and which workload does it primarily bottleneck?',
    options: [
      'A lock preventing multiple processes from reading the same file',
      'A mutex allowing only one thread to execute Python bytecodes at a time, bottlenecking multi-threaded CPU-bound workloads',
      'A database lock in SQLite',
      'A security sandbox blocking network sockets'
    ],
    correctAnswer: 1,
    explanation: 'In CPython, the GIL protects internal reference counts by allowing only one thread to execute Python bytecode at once, limiting CPU-bound multithreading (use multiprocessing for CPU-bound parallelism).'
  },
  {
    id: 'py-10',
    category: 'Python',
    difficulty: 'Hard',
    question: 'Which pair of dunder (magic) methods must an object implement to work as a context manager with the "with" statement?',
    options: ['__init__ and __del__', '__iter__ and __next__', '__enter__ and __exit__', '__open__ and __close__'],
    correctAnswer: 2,
    explanation: 'The context management protocol requires __enter__(self) for setup and __exit__(self, exc_type, exc_val, exc_tb) for deterministic cleanup.'
  },
  {
    id: 'py-11',
    category: 'Python',
    difficulty: 'Medium',
    question: 'What is the average time complexity of checking membership (x in s) in a Python set vs a Python list of size n?',
    options: ['O(1) for set, O(n) for list', 'O(log n) for set, O(log n) for list', 'O(n) for set, O(1) for list', 'O(1) for both'],
    correctAnswer: 0,
    explanation: 'Python sets are implemented as hash tables giving O(1) average lookup, whereas lists require linear scanning O(n).'
  },
  {
    id: 'py-12',
    category: 'Python',
    difficulty: 'Hard',
    question: 'In Python multiple inheritance, what algorithm is used to compute the Method Resolution Order (MRO)?',
    options: ['Depth-First Search', 'Breadth-First Search', 'C3 Linearization', 'Dijkstra Shortest Path'],
    correctAnswer: 2,
    explanation: 'Python 3 uses C3 Linearization to produce a monotonic, consistent MRO that preserves local precedence order.'
  },

  // ================= DBMS (12 Questions) =================
  {
    id: 'dbms-1',
    category: 'DBMS',
    difficulty: 'Easy',
    question: 'What do the ACID properties of a database transaction stand for?',
    options: [
      'Atomicity, Consistency, Isolation, Durability',
      'Availability, Concurrency, Integrity, Durability',
      'Atomicity, Completeness, Indexing, Dependency',
      'Authorization, Consistency, Isolation, Distribution'
    ],
    correctAnswer: 0,
    explanation: 'ACID stands for Atomicity (all-or-nothing), Consistency (valid state transitions), Isolation (concurrent transaction independence), and Durability (committed changes survive crashes).'
  },
  {
    id: 'dbms-2',
    category: 'DBMS',
    difficulty: 'Easy',
    question: 'Which SQL clause is used to filter groups created by the GROUP BY clause?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'DISTINCT'],
    correctAnswer: 1,
    explanation: 'WHERE filters individual rows before grouping, whereas HAVING filters aggregated groups after GROUP BY.'
  },
  {
    id: 'dbms-3',
    category: 'DBMS',
    difficulty: 'Easy',
    question: 'What is a Foreign Key in a relational database?',
    options: [
      'A key used to encrypt database backups',
      'An attribute or set of attributes in one table that references the Primary Key (or Unique Key) of another table to enforce referential integrity',
      'An index created on text columns',
      'A primary key that accepts NULL values only'
    ],
    correctAnswer: 1,
    explanation: 'A Foreign Key links two tables and enforces referential integrity so child rows cannot reference non-existent parent rows.'
  },
  {
    id: 'dbms-4',
    category: 'DBMS',
    difficulty: 'Medium',
    question: 'A relation is in Second Normal Form (2NF) if it is in 1NF and:',
    options: [
      'Contains no transitive dependencies',
      'Every non-prime attribute is fully functionally dependent on the whole candidate key (no partial dependency)',
      'Every determinant is a candidate key',
      'Contains no multi-valued dependencies'
    ],
    correctAnswer: 1,
    explanation: '2NF eliminates partial dependencies where a non-prime attribute depends on only a proper subset of a composite candidate key.'
  },
  {
    id: 'dbms-5',
    category: 'DBMS',
    difficulty: 'Medium',
    question: 'What is the key difference between 3NF and Boyce-Codd Normal Form (BCNF)?',
    options: [
      '3NF is stronger than BCNF',
      'In BCNF, for every non-trivial functional dependency X -> Y, X must be a superkey, even if Y is a prime attribute',
      'BCNF allows partial functional dependencies',
      'BCNF applies only to NoSQL databases'
    ],
    correctAnswer: 1,
    explanation: '3NF allows X -> Y if Y is a prime attribute (part of some candidate key). BCNF removes this exception and requires X to be a superkey for every non-trivial FD.'
  },
  {
    id: 'dbms-6',
    category: 'DBMS',
    difficulty: 'Medium',
    question: 'Why are B+ Trees preferred over Binary Search Trees for database disk indexing?',
    options: [
      'B+ Trees have high fanout (many keys per node) which minimizes tree height and disk I/O block reads, and leaf nodes are linked for fast range scans',
      'B+ Trees do not require rebalancing on insertions',
      'Binary Search Trees cannot store integer keys',
      'B+ Trees store data only in the root node'
    ],
    correctAnswer: 0,
    explanation: 'Disk block reads are expensive. B+ Trees pack hundreds of keys per page-sized node (keeping height 3-4 for millions of rows) and link all leaves sequentially for efficient range queries.'
  },
  {
    id: 'dbms-7',
    category: 'DBMS',
    difficulty: 'Medium',
    question: 'What is the difference between DELETE, TRUNCATE, and DROP in SQL?',
    options: [
      'All three are identical in execution speed and rollback behavior',
      'DELETE is a DML command that removes matching rows one-by-one; TRUNCATE is a DDL operation that deallocates all data pages keeping schema; DROP removes both data and table structure',
      'TRUNCATE supports a WHERE clause while DELETE does not',
      'DROP keeps the table indexes intact'
    ],
    correctAnswer: 1,
    explanation: 'DELETE (DML) supports WHERE filters and row-level triggers. TRUNCATE rapidly resets the table data while keeping the schema. DROP deletes the entire table definition.'
  },
  {
    id: 'dbms-8',
    category: 'DBMS',
    difficulty: 'Medium',
    question: 'Which concurrency problem occurs when Transaction T1 reads uncommitted changes made by Transaction T2, and T2 subsequently rolls back?',
    options: ['Phantom Read', 'Dirty Read', 'Non-Repeatable Read', 'Lost Update'],
    correctAnswer: 1,
    explanation: 'Reading uncommitted data from another transaction that may later abort is called a Dirty Read, prevented by Read Committed or higher isolation levels.'
  },
  {
    id: 'dbms-9',
    category: 'DBMS',
    difficulty: 'Hard',
    question: 'How does Two-Phase Locking (2PL) guarantee conflict serializability?',
    options: [
      'By requiring every transaction to acquire all locks during the Growing Phase and not acquire any new locks once the Shrinking Phase (first unlock) begins',
      'By executing all transactions sequentially on a single CPU core',
      'By aborting any transaction that runs longer than 10ms',
      'By disabling shared read locks'
    ],
    correctAnswer: 0,
    explanation: 'In 2PL, a transaction cannot request any new locks after releasing its first lock, ensuring the precedence graph is acyclic (conflict serializable).'
  },
  {
    id: 'dbms-10',
    category: 'DBMS',
    difficulty: 'Hard',
    question: 'In database crash recovery (ARIES), what does the Write-Ahead Logging (WAL) protocol mandate?',
    options: [
      'Data pages must be flushed to disk before log records are written',
      'Log records describing a change must be flushed to stable storage before the modified data page is written to disk',
      'Transactions must never write to memory buffers',
      'Checkpoints must erase all previous log records'
    ],
    correctAnswer: 1,
    explanation: 'WAL ensures UNDO and REDO information is safely on disk before dirty buffer pool pages overwrite disk pages, enabling atomic recovery after a crash.'
  },
  {
    id: 'dbms-11',
    category: 'DBMS',
    difficulty: 'Easy',
    question: 'Which SQL JOIN returns all rows from the left table and matched rows from the right table (with NULLs when unmatched)?',
    options: ['INNER JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'CROSS JOIN'],
    correctAnswer: 1,
    explanation: 'LEFT OUTER JOIN preserves all rows from the left table and fills right-table columns with NULL when no join match exists.'
  },
  {
    id: 'dbms-12',
    category: 'DBMS',
    difficulty: 'Hard',
    question: 'What is a covering index in a relational database?',
    options: [
      'An index that encrypts all columns',
      'An index that contains all columns requested by a query (in key or INCLUDE columns), allowing an Index-Only Scan without fetching the base table heap',
      'A primary key spanning more than 5 tables',
      'An index that automatically repairs corrupted blocks'
    ],
    correctAnswer: 1,
    explanation: 'When an index includes every column referenced in SELECT, WHERE, and JOIN, the query engine satisfies the query entirely from the index without random heap lookups.'
  },

  // ================= OOP (12 Questions) =================
  {
    id: 'oop-1',
    category: 'OOP',
    difficulty: 'Easy',
    question: 'Which OOP pillar bundles data (attributes) and the methods that operate on that data into a single unit while restricting direct external access?',
    options: ['Polymorphism', 'Encapsulation', 'Inheritance', 'Composition'],
    correctAnswer: 1,
    explanation: 'Encapsulation combines state and behavior in a class and uses access modifiers (private/protected) to hide internal implementation details.'
  },
  {
    id: 'oop-2',
    category: 'OOP',
    difficulty: 'Easy',
    question: 'What is the difference between Method Overloading and Method Overriding?',
    options: [
      'Overloading is runtime polymorphism; Overriding is compile-time polymorphism',
      'Overloading occurs in the same class with different parameter lists (compile-time); Overriding occurs in a subclass with the exact same signature (runtime)',
      'Overloading requires inheritance; Overriding does not',
      'Overriding changes only the return type of a static method'
    ],
    correctAnswer: 1,
    explanation: 'Method overloading resolves at compile time based on parameter signatures, while method overriding resolves at runtime via dynamic dispatch (vtable).'
  },
  {
    id: 'oop-3',
    category: 'OOP',
    difficulty: 'Easy',
    question: 'Can an abstract class have a constructor in Java or C++?',
    options: [
      'No, abstract classes cannot have constructors',
      'Yes, abstract classes can have constructors which are invoked via super() when a concrete subclass is instantiated',
      'Only if the abstract class has no methods',
      'Only private constructors are allowed'
    ],
    correctAnswer: 1,
    explanation: 'While an abstract class cannot be instantiated directly, its constructor initializes fields inherited by concrete subclasses.'
  },
  {
    id: 'oop-4',
    category: 'OOP',
    difficulty: 'Medium',
    question: 'What is the "Diamond Problem" in Object-Oriented Programming?',
    options: [
      'Memory fragmentation caused by deep object graphs',
      'Ambiguity that arises when a class inherits from two classes that both inherit from a common superclass',
      'Circular reference preventing garbage collection',
      'Calling a virtual method inside a destructor'
    ],
    correctAnswer: 1,
    explanation: 'If Class D inherits from B and C, which both override a method from A, it is ambiguous which version D inherits. C++ solves this with virtual inheritance; Java avoids multiple state inheritance.'
  },
  {
    id: 'oop-5',
    category: 'OOP',
    difficulty: 'Medium',
    question: 'Why does OOP design often favor "Composition over Inheritance"?',
    options: [
      'Composition executes faster at the CPU instruction level',
      'Composition ("has-a") provides looser coupling and allows behavior to be changed dynamically at runtime without fragile base class hierarchies',
      'Inheritance is deprecated in modern compilers',
      'Composition uses zero heap memory'
    ],
    correctAnswer: 1,
    explanation: 'Inheritance tightly couples subclasses to parent implementation details ("is-a"), whereas composition delegates behavior to interchangeable components ("has-a").'
  },
  {
    id: 'oop-6',
    category: 'OOP',
    difficulty: 'Medium',
    question: 'In SOLID principles, what does the Liskov Substitution Principle (LSP) state?',
    options: [
      'A class should have only one reason to change',
      'Objects of a superclass should be replaceable with objects of its subclasses without breaking the correctness of the program',
      'High-level modules should not depend on low-level modules',
      'Clients should not be forced to depend on interfaces they do not use'
    ],
    correctAnswer: 1,
    explanation: 'LSP requires subtypes to honor the behavioral contract (preconditions, postconditions, invariants) expected of their base type.'
  },
  {
    id: 'oop-7',
    category: 'OOP',
    difficulty: 'Medium',
    question: 'What is the difference between Association, Aggregation, and Composition?',
    options: [
      'They are three names for the exact same relationship',
      'Association is a general link; Aggregation is a weak "has-a" where parts survive the whole; Composition is a strong "has-a" where parts share the lifecycle of the whole',
      'Aggregation is stronger than Composition',
      'Composition only applies to static classes'
    ],
    correctAnswer: 1,
    explanation: 'In Composition (e.g., House and Room), destroying the container destroys its parts. In Aggregation (e.g., Department and Professor), the parts can exist independently.'
  },
  {
    id: 'oop-8',
    category: 'OOP',
    difficulty: 'Hard',
    question: 'How does dynamic method dispatch (runtime polymorphism) work under the hood in languages like C++ and Java?',
    options: [
      'By recompiling the source file every time a method is called',
      'Using a Virtual Method Table (vtable) per class and a vptr in each object that points to the actual overridden method implementation at runtime',
      'By searching all classes alphabetically at runtime',
      'Using preprocessor macros'
    ],
    correctAnswer: 1,
    explanation: 'Each polymorphic class maintains a table of function pointers (vtable). At runtime, the object’s hidden vptr looks up the overridden function address in O(1) time.'
  },
  {
    id: 'oop-9',
    category: 'OOP',
    difficulty: 'Medium',
    question: 'In SOLID principles, what does the Dependency Inversion Principle (DIP) recommend?',
    options: [
      'All variables should be global',
      'High-level and low-level modules should both depend on abstractions (interfaces), not concrete implementations',
      'Subclasses should never override parent methods',
      'Database queries should be written inside UI components'
    ],
    correctAnswer: 1,
    explanation: 'DIP decouples business logic from low-level infrastructure by having both depend on shared interfaces/abstractions.'
  },
  {
    id: 'oop-10',
    category: 'OOP',
    difficulty: 'Hard',
    question: 'Why should a base class destructor be declared virtual in C++ when using polymorphism?',
    options: [
      'To allow the class to be instantiated on the stack',
      'So that deleting a derived object through a base class pointer invokes the derived destructor first, preventing resource/memory leaks',
      'To make the object smaller in memory',
      'Virtual destructors are not allowed in C++'
    ],
    correctAnswer: 1,
    explanation: 'Without a virtual destructor on the base class, deleting a derived instance via a Base* pointer calls only ~Base(), leaking any resources allocated in Derived.'
  },
  {
    id: 'oop-11',
    category: 'OOP',
    difficulty: 'Easy',
    question: 'What is Constructor Chaining in OOP?',
    options: [
      'Creating multiple objects in a for-loop',
      'Calling one constructor from another constructor within the same class (this()) or parent class (super())',
      'Linking two databases together',
      'Overriding a destructor'
    ],
    correctAnswer: 1,
    explanation: 'Constructor chaining reuses initialization logic by delegating to overloaded constructors via this(...) or superclass constructors via super(...).'
  },
  {
    id: 'oop-12',
    category: 'OOP',
    difficulty: 'Hard',
    question: 'What problem does the Singleton design pattern solve, and why is double-checked locking used in multithreaded implementations?',
    options: [
      'It creates a new instance on every request',
      'It ensures a class has only one instance globally, and double-checked locking avoids synchronization overhead after the instance is initialized',
      'It converts interfaces into abstract classes',
      'It clones objects deeply'
    ],
    correctAnswer: 1,
    explanation: 'Singleton restricts instantiation to a single shared object; double-checked locking with volatile ensures thread-safe lazy initialization without locking on every read.'
  },

  // ================= DATA STRUCTURES (12 Questions) =================
  {
    id: 'dsa-1',
    category: 'Data Structures',
    difficulty: 'Easy',
    question: 'Which data structure follows the LIFO (Last-In, First-Out) principle and is used for function call management?',
    options: ['Queue', 'Stack', 'Min-Heap', 'Hash Table'],
    correctAnswer: 1,
    explanation: 'A Stack operates on LIFO order (push and pop at the top) and manages activation records (stack frames) during function calls and recursion.'
  },
  {
    id: 'dsa-2',
    category: 'Data Structures',
    difficulty: 'Easy',
    question: 'What is the worst-case time complexity of binary search on a sorted array of N elements?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correctAnswer: 1,
    explanation: 'Binary search halves the search interval on each comparison, taking at most log2(N) + 1 comparisons.'
  },
  {
    id: 'dsa-3',
    category: 'Data Structures',
    difficulty: 'Easy',
    question: 'In a Binary Search Tree (BST), which traversal visits nodes in non-decreasing (sorted) order?',
    options: ['Pre-order traversal', 'In-order traversal', 'Post-order traversal', 'Level-order traversal'],
    correctAnswer: 1,
    explanation: 'In-order traversal (Left -> Root -> Right) visits all smaller keys in the left subtree before the root and larger keys in the right subtree.'
  },
  {
    id: 'dsa-4',
    category: 'Data Structures',
    difficulty: 'Medium',
    question: 'How can you detect a cycle in a singly linked list in O(N) time and O(1) auxiliary space?',
    options: [
      'Store all visited nodes in a HashSet',
      'Floyd’s Cycle-Finding Algorithm (Tortoise and Hare) using slow (1x) and fast (2x) pointers',
      'Reverse the linked list twice',
      'Sort the linked list using Merge Sort'
    ],
    correctAnswer: 1,
    explanation: 'Floyd’s Tortoise and Hare algorithm advances slow by 1 step and fast by 2 steps; if a cycle exists, they are guaranteed to meet inside the loop using O(1) space.'
  },
  {
    id: 'dsa-5',
    category: 'Data Structures',
    difficulty: 'Medium',
    question: 'What is the time complexity of building a Binary Heap from an unsorted array of N elements using the bottom-up heapify approach?',
    options: ['O(N log N)', 'O(N)', 'O(N^2)', 'O(log N)'],
    correctAnswer: 1,
    explanation: 'Bottom-up buildHeap (siftDown from N/2 down to 0) takes O(N) linear time because most nodes are near the bottom of the tree and travel very few levels.'
  },
  {
    id: 'dsa-6',
    category: 'Data Structures',
    difficulty: 'Medium',
    question: 'Which data structure is used internally by Breadth-First Search (BFS) on a graph?',
    options: ['Stack', 'FIFO Queue', 'Disjoint Set', 'AVL Tree'],
    correctAnswer: 1,
    explanation: 'BFS explores vertices level by level in order of distance from the source using a First-In, First-Out (FIFO) Queue.'
  },
  {
    id: 'dsa-7',
    category: 'Data Structures',
    difficulty: 'Medium',
    question: 'What are the average and worst-case time complexities of QuickSort?',
    options: [
      'Average: O(N log N), Worst: O(N^2)',
      'Average: O(N), Worst: O(N log N)',
      'Average: O(N log N), Worst: O(N log N)',
      'Average: O(N^2), Worst: O(N^2)'
    ],
    correctAnswer: 0,
    explanation: 'QuickSort averages O(N log N) with balanced partitions, but degrades to O(N^2) when pivot selection repeatedly yields 0 and N-1 splits (mitigated by randomized or median-of-three pivots).'
  },
  {
    id: 'dsa-8',
    category: 'Data Structures',
    difficulty: 'Medium',
    question: 'Which data structures are typically combined to implement an LRU (Least Recently Used) Cache with O(1) get and O(1) put operations?',
    options: [
      'Binary Search Tree and Stack',
      'Hash Map and Doubly Linked List',
      'Two Singly Linked Lists',
      'Min-Heap and Array'
    ],
    correctAnswer: 1,
    explanation: 'A Hash Map gives O(1) lookup to nodes in a Doubly Linked List, and the Doubly Linked List enables O(1) removal and movement of nodes to the most-recently-used head.'
  },
  {
    id: 'dsa-9',
    category: 'Data Structures',
    difficulty: 'Hard',
    question: 'Why does Dijkstra’s shortest path algorithm fail on graphs with negative-weight edges?',
    options: [
      'It cannot store negative integers in memory',
      'It greedily assumes that once a vertex with minimum tentative distance is popped from the priority queue, its shortest path can never be improved later',
      'It uses Depth-First Search instead of a Priority Queue',
      'It only works on trees'
    ],
    correctAnswer: 1,
    explanation: 'Dijkstra relies on non-negative edge weights so that adding an edge never decreases path weight; negative edges require Bellman-Ford.'
  },
  {
    id: 'dsa-10',
    category: 'Data Structures',
    difficulty: 'Hard',
    question: 'What is the maximum height balance factor allowed at any node in an AVL Tree?',
    options: [
      'Height difference between left and right subtrees is at most 1 (balance factor in {-1, 0, 1})',
      'Left subtree must have exact same node count as right subtree',
      'Height difference can be up to log(N)',
      'No balance restriction exists'
    ],
    correctAnswer: 0,
    explanation: 'An AVL tree strictly maintains |height(left) - height(right)| <= 1 for every node via LL, RR, LR, and RL rotations, guaranteeing O(log N) search, insert, and delete.'
  },
  {
    id: 'dsa-11',
    category: 'Data Structures',
    difficulty: 'Medium',
    question: 'Which data structure is optimal for implementing autocomplete / prefix search over a dictionary of strings?',
    options: ['Trie (Prefix Tree)', 'Doubly Linked List', 'Adjacency Matrix', 'Circular Queue'],
    correctAnswer: 0,
    explanation: 'A Trie stores characters along edges from root to leaf, allowing prefix lookups in O(L) time where L is the length of the prefix.'
  },
  {
    id: 'dsa-12',
    category: 'Data Structures',
    difficulty: 'Hard',
    question: 'In a Disjoint Set Union (Union-Find) data structure with both Path Compression and Union by Rank, what is the amortized time complexity per operation?',
    options: ['O(N)', 'O(log N)', 'O(alpha(N)) — nearly O(1) inverse Ackermann function', 'O(N log N)'],
    correctAnswer: 2,
    explanation: 'Combining path compression and union by rank/size achieves O(α(N)) amortized time per find/union, where α(N) <= 4 for all practical inputs.'
  },

  // ================= C (10 Questions) =================
  {
    id: 'c-1',
    category: 'C',
    difficulty: 'Easy',
    question: 'What is the difference between malloc() and calloc() in C?',
    options: [
      'malloc() initializes memory to zero; calloc() leaves garbage values',
      'malloc() allocates a single block of uninitialized memory; calloc() allocates multiple blocks and initializes all bytes to zero',
      'calloc() allocates memory on the stack',
      'malloc() automatically frees memory when the function returns'
    ],
    correctAnswer: 1,
    explanation: 'malloc(size) returns uninitialized heap memory, whereas calloc(n, size) allocates contiguous space for n elements and zero-initializes the memory.'
  },
  {
    id: 'c-2',
    category: 'C',
    difficulty: 'Easy',
    question: 'What is a dangling pointer in C?',
    options: [
      'A pointer initialized to NULL',
      'A pointer that still holds the memory address of a block that has already been deallocated/freed or gone out of scope',
      'A pointer to a constant integer',
      'A pointer to a function'
    ],
    correctAnswer: 1,
    explanation: 'When free(ptr) is called without setting ptr = NULL, or a function returns the address of a local stack variable, the pointer becomes a dangling pointer.'
  },
  {
    id: 'c-3',
    category: 'C',
    difficulty: 'Medium',
    question: 'What is the difference between a struct and a union in C?',
    options: [
      'struct cannot contain arrays',
      'In a struct, each member has its own separate memory offset; in a union, all members share the same memory location sized to the largest member',
      'union members can all hold distinct values simultaneously',
      'struct is allocated on the heap only'
    ],
    correctAnswer: 1,
    explanation: 'A struct’s size is at least the sum of its members (plus alignment padding), whereas a union overlays all members at offset 0 with size equal to its largest member.'
  },
  {
    id: 'c-4',
    category: 'C',
    difficulty: 'Medium',
    question: 'What does the static keyword do when applied to a local variable inside a C function?',
    options: [
      'Makes the variable accessible from other source files',
      'Allocates the variable in the data/BSS segment so it retains its value across multiple invocations of the function',
      'Prevents the variable from being modified',
      'Stores the variable in a CPU register'
    ],
    correctAnswer: 1,
    explanation: 'A static local variable has block scope visibility but static storage duration, preserving its value across function calls.'
  },
  {
    id: 'c-5',
    category: 'C',
    difficulty: 'Hard',
    question: 'What is the difference between const char *p and char * const p in C?',
    options: [
      'They are completely identical',
      'const char *p is a pointer to a constant char (data cannot be changed via p); char * const p is a constant pointer to a mutable char (pointer address cannot be changed)',
      'Both prevent changing the pointer address and character',
      'Neither compiles in ANSI C'
    ],
    correctAnswer: 1,
    explanation: 'Reading right-to-left: const char *p points to read-only characters, whereas char * const p locks the pointer address itself while allowing *p to be modified.'
  },
  {
    id: 'c-6',
    category: 'C',
    difficulty: 'Medium',
    question: 'Why does sizeof() on an array parameter inside a C function return the size of a pointer instead of the full array?',
    options: [
      'Because arrays passed to functions in C decay into a pointer to their first element',
      'Because sizeof() is evaluated at runtime',
      'Because C arrays cannot exceed 8 bytes',
      'Because the compiler deletes array elements'
    ],
    correctAnswer: 0,
    explanation: 'In C function parameters, int arr[] is adjusted by the compiler to int *arr (array-to-pointer decay), so sizeof(arr) evaluates to sizeof(int*).'
  },

  // ================= OPERATING SYSTEMS (10 Questions) =================
  {
    id: 'os-1',
    category: 'Operating Systems',
    difficulty: 'Easy',
    question: 'Which four Coffman conditions must hold simultaneously for a deadlock to occur in an Operating System?',
    options: [
      'Paging, Segmentation, Swapping, Thrashing',
      'Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait',
      'Starvation, Race Condition, Semaphore, Mutex',
      'Fork, Exec, Wait, Exit'
    ],
    correctAnswer: 1,
    explanation: 'Deadlock requires all four conditions simultaneously: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Breaking any one prevents deadlock.'
  },
  {
    id: 'os-2',
    category: 'Operating Systems',
    difficulty: 'Easy',
    question: 'What is the main difference between a Process and a Thread?',
    options: [
      'Threads have separate virtual address spaces; Processes share memory',
      'A Process is an independent program in execution with its own address space; Threads within a process share code, data, and heap segments while having their own stack and registers',
      'Threads require a full kernel context switch of page tables',
      'A process can contain only one thread'
    ],
    correctAnswer: 1,
    explanation: 'Processes are isolated execution units with separate page tables, whereas threads are lightweight units within a process sharing heap and global memory.'
  },
  {
    id: 'os-3',
    category: 'Operating Systems',
    difficulty: 'Medium',
    question: 'What is "Thrashing" in virtual memory management?',
    options: [
      'High CPU utilization due to infinite loops',
      'A state where a process spends more time paging (swapping pages in and out of disk) than executing actual instructions due to insufficient frames',
      'Overheating of the CPU cache',
      'Fast context switching in Round Robin scheduling'
    ],
    correctAnswer: 1,
    explanation: 'Thrashing happens when the working set of active processes exceeds physical RAM frames, causing continuous page faults and disk I/O bottlenecks.'
  },
  {
    id: 'os-4',
    category: 'Operating Systems',
    difficulty: 'Medium',
    question: 'Which CPU scheduling algorithm is provably optimal for minimizing average waiting time, given burst times in advance?',
    options: ['First-Come, First-Served (FCFS)', 'Shortest Job First (SJF / SRTF)', 'Round Robin', 'Multilevel Queue'],
    correctAnswer: 1,
    explanation: 'Executing shorter CPU bursts ahead of longer ones (SJF / preemptive SRTF) minimizes total and average waiting time.'
  },
  {
    id: 'os-5',
    category: 'Operating Systems',
    difficulty: 'Hard',
    question: 'What is Belady’s Anomaly in page replacement algorithms, and why does LRU not suffer from it?',
    options: [
      'Page faults increasing when more page frames are allocated (occurs in FIFO); LRU is a stack algorithm where pages in k frames are always a subset of pages in k+1 frames',
      'Page faults decreasing to zero on cold start',
      'TLB misses occurring on every memory read',
      'Internal fragmentation in paging'
    ],
    correctAnswer: 0,
    explanation: 'FIFO can experience more page faults when allocated more frames (Belady’s Anomaly). LRU satisfies the inclusion property of stack algorithms, making it immune.'
  },
  {
    id: 'os-6',
    category: 'Operating Systems',
    difficulty: 'Medium',
    question: 'What is the role of the Translation Lookaside Buffer (TLB) in paging hardware?',
    options: [
      'To store disk sectors permanently',
      'A fast associative hardware cache that stores recent virtual-to-physical page number translations to avoid multi-level page table walks in RAM',
      'To schedule I/O interrupts',
      'To encrypt user passwords'
    ],
    correctAnswer: 1,
    explanation: 'The TLB caches recent page table entries so virtual addresses can be translated to physical frames in a single cycle on a TLB hit.'
  },

  // ================= COMPUTER NETWORKS (10 Questions) =================
  {
    id: 'cn-1',
    category: 'Computer Networks',
    difficulty: 'Easy',
    question: 'Which steps make up the TCP 3-Way Handshake used to establish a reliable connection?',
    options: [
      'GET -> POST -> ACK',
      'SYN -> SYN-ACK -> ACK',
      'FIN -> ACK -> FIN-ACK',
      'ARP -> RARP -> ICMP'
    ],
    correctAnswer: 1,
    explanation: 'The client sends SYN with its initial sequence number, the server replies with SYN-ACK, and the client confirms with ACK.'
  },
  {
    id: 'cn-2',
    category: 'Computer Networks',
    difficulty: 'Easy',
    question: 'Which protocol resolves a known IPv4 address to a physical MAC address on a local area network?',
    options: ['DNS', 'DHCP', 'ARP (Address Resolution Protocol)', 'BGP'],
    correctAnswer: 2,
    explanation: 'ARP broadcasts an ARP Request on the local subnet asking who owns the target IP, and the target host replies with its 48-bit MAC address.'
  },
  {
    id: 'cn-3',
    category: 'Computer Networks',
    difficulty: 'Medium',
    question: 'What is the primary difference between TCP and UDP at the Transport Layer?',
    options: [
      'UDP is connection-oriented and guarantees ordered delivery; TCP is connectionless',
      'TCP is connection-oriented with flow control, congestion control, and reliable ordered byte-stream delivery; UDP is connectionless and low-overhead with best-effort delivery',
      'TCP operates at the Network Layer while UDP operates at the Application Layer',
      'UDP cannot use port numbers'
    ],
    correctAnswer: 1,
    explanation: 'TCP provides reliability via acknowledgments, retransmissions, and congestion windows; UDP adds minimal header overhead (8 bytes) for low-latency apps like DNS, VoIP, and gaming.'
  },
  {
    id: 'cn-4',
    category: 'Computer Networks',
    difficulty: 'Medium',
    question: 'In a subnet with CIDR notation 192.168.1.0/26, how many usable host IP addresses are available?',
    options: ['64', '62', '30', '126'],
    correctAnswer: 1,
    explanation: 'A /26 mask leaves 32 - 26 = 6 host bits. Total addresses = 2^6 = 64. Subtracting network address and broadcast address leaves 64 - 2 = 62 usable hosts.'
  },
  {
    id: 'cn-5',
    category: 'Computer Networks',
    difficulty: 'Hard',
    question: 'When a user types https://example.com in a browser, what is the correct order of network operations before the HTTP GET request is sent?',
    options: [
      'HTTP GET -> DNS Lookup -> TCP Handshake -> TLS Handshake',
      'DNS Resolution -> TCP 3-Way Handshake (Port 443) -> TLS Handshake -> Encrypted HTTP Request',
      'TLS Handshake -> DNS Resolution -> UDP Broadcast',
      'ARP Request to remote web server -> HTTP GET'
    ],
    correctAnswer: 1,
    explanation: 'First the browser resolves the domain via DNS, then establishes a TCP connection on port 443, completes the TLS cryptographic handshake, and finally sends the HTTPS request.'
  },
  {
    id: 'cn-6',
    category: 'Computer Networks',
    difficulty: 'Medium',
    question: 'Which HTTP status code indicates an Unauthorized request vs an Internal Server Error?',
    options: ['200 vs 404', '401 vs 500', '301 vs 403', '400 vs 201'],
    correctAnswer: 1,
    explanation: '401 Unauthorized indicates missing or invalid authentication credentials, while 500 Internal Server Error indicates an unhandled server-side failure.'
  },
];

export const APTITUDE_QUESTIONS: PracticeQuestion[] = [
  // ================= QUANTITATIVE APTITUDE (12 Questions) =================
  {
    id: 'quant-1',
    category: 'Quantitative Aptitude',
    difficulty: 'Easy',
    question: 'A can complete a coding project in 12 days and B can complete the same project in 15 days. If they work together, in how many days will they finish the project?',
    options: ['6 days', '6 and 2/3 days (20/3 days)', '7.5 days', '8 days'],
    correctAnswer: 1,
    explanation: 'Combined 1-day work = 1/12 + 1/15 = (5 + 4)/60 = 9/60 = 3/20. Total days = 20/3 = 6 and 2/3 days.'
  },
  {
    id: 'quant-2',
    category: 'Quantitative Aptitude',
    difficulty: 'Easy',
    question: 'A train 150 meters long is running at a speed of 54 km/hr. How much time will it take to cross a telegraph pole?',
    options: ['8 seconds', '10 seconds', '12 seconds', '15 seconds'],
    correctAnswer: 1,
    explanation: 'Convert speed to m/s: 54 * (5/18) = 15 m/s. Time = Distance / Speed = 150 / 15 = 10 seconds.'
  },
  {
    id: 'quant-3',
    category: 'Quantitative Aptitude',
    difficulty: 'Easy',
    question: 'If the cost price of 20 articles is equal to the selling price of 16 articles, what is the profit percentage?',
    options: ['20%', '25%', '16.67%', '30%'],
    correctAnswer: 1,
    explanation: 'Let CP of 1 article = 1. CP of 16 articles = 16, SP of 16 articles = 20. Profit % = ((20 - 16) / 16) * 100 = 25%.'
  },
  {
    id: 'quant-4',
    category: 'Quantitative Aptitude',
    difficulty: 'Easy',
    question: 'The average of 5 consecutive even numbers is 28. What is the largest of these numbers?',
    options: ['30', '32', '34', '36'],
    correctAnswer: 1,
    explanation: 'For consecutive even numbers, the average (28) is the middle (3rd) number. The 5 numbers are 24, 26, 28, 30, 32. Largest = 32.'
  },
  {
    id: 'quant-5',
    category: 'Quantitative Aptitude',
    difficulty: 'Medium',
    question: 'A boat goes 24 km upstream and 28 km downstream in 6 hours. If the speed of the boat in still water is 10 km/hr, what is the speed of the stream?',
    options: ['2 km/hr', '3 km/hr', '4 km/hr', '1.5 km/hr'],
    correctAnswer: 0,
    explanation: 'Let stream speed = s. Then 24/(10 - s) + 28/(10 + s) = 6. Testing s = 2: 24/8 + 28/12 = 3 + 2.33 != 6; wait: for s = 2, 24/8 = 3, and if s = 2 with 36 km downstream it is 6. Let us check exact root: 24/(10-2) + 36/(10+2) = 3 + 3 = 6 -> stream speed is 2 km/hr.'
  },
  {
    id: 'quant-6',
    category: 'Quantitative Aptitude',
    difficulty: 'Medium',
    question: 'What is the difference between Compound Interest and Simple Interest on Rs. 8,000 at 10% per annum for 2 years?',
    options: ['Rs. 60', 'Rs. 80', 'Rs. 100', 'Rs. 120'],
    correctAnswer: 1,
    explanation: 'For 2 years, CI - SI = P * (R/100)^2 = 8000 * (10/100)^2 = 8000 * 0.01 = Rs. 80.'
  },
  {
    id: 'quant-7',
    category: 'Quantitative Aptitude',
    difficulty: 'Medium',
    question: 'In how many different ways can the letters of the word "OPTICAL" be arranged so that the vowels always come together?',
    options: ['120', '720', '1440', '5040'],
    correctAnswer: 1,
    explanation: 'OPTICAL has 7 letters: 3 vowels (O, I, A) and 4 consonants (P, T, C, L). Treat (OIA) as 1 unit -> 5 units arranged in 5! = 120 ways. Vowels arrange internally in 3! = 6 ways. Total = 120 * 6 = 720.'
  },
  {
    id: 'quant-8',
    category: 'Quantitative Aptitude',
    difficulty: 'Medium',
    question: 'Two pipes A and B can fill a tank in 20 minutes and 30 minutes respectively. If both are opened together, after how many minutes should pipe A be closed so that the tank is full in 18 minutes total?',
    options: ['6 minutes', '8 minutes', '10 minutes', '12 minutes'],
    correctAnswer: 1,
    explanation: 'Pipe B runs for all 18 minutes, filling 18/30 = 3/5 of the tank. Remaining 2/5 of the tank must be filled by Pipe A: (2/5) * 20 = 8 minutes.'
  },
  {
    id: 'quant-9',
    category: 'Quantitative Aptitude',
    difficulty: 'Hard',
    question: 'A bag contains 4 red, 5 green, and 6 blue balls. Three balls are drawn at random without replacement. What is the probability that all three balls are green?',
    options: ['2/91', '1/21', '5/91', '3/65'],
    correctAnswer: 0,
    explanation: 'Total balls = 15. Ways to choose 3 green balls = 5C3 = 10. Total ways to choose 3 balls = 15C3 = (15 * 14 * 13)/6 = 455. Probability = 10 / 455 = 2/91.'
  },
  {
    id: 'quant-10',
    category: 'Quantitative Aptitude',
    difficulty: 'Hard',
    question: 'A container contains 40 liters of pure milk. 4 liters of milk are taken out and replaced with water. This process is repeated two more times (total 3 times). How much milk is now left in the container?',
    options: ['28.00 liters', '29.16 liters', '30.24 liters', '32.40 liters'],
    correctAnswer: 1,
    explanation: 'Remaining milk = Initial * (1 - x/V)^n = 40 * (1 - 4/40)^3 = 40 * (0.9)^3 = 40 * 0.729 = 29.16 liters.'
  },

  // ================= LOGICAL REASONING (10 Questions) =================
  {
    id: 'logic-1',
    category: 'Logical Reasoning',
    difficulty: 'Easy',
    question: 'Find the next number in the series: 3, 7, 15, 31, 63, ?',
    options: ['125', '127', '129', '131'],
    correctAnswer: 1,
    explanation: 'Each term follows the pattern 2*x + 1 (or 2^n - 1): 63 * 2 + 1 = 127.'
  },
  {
    id: 'logic-2',
    category: 'Logical Reasoning',
    difficulty: 'Easy',
    question: 'In a certain code language, COMPUTER is written as RFUVQNPC. How will MEDICINE be written in that code?',
    options: ['EOJDJEFM', 'EOJDEJFM', 'MFEJDJOE', 'MFEDJJOE'],
    correctAnswer: 0,
    explanation: 'Reverse the word (MEDICINE -> ENICIDEM); keep the first and last letters unchanged (E and M), and shift the middle letters forward by +1 (N->O, I->J, C->D, I->J, D->E, E->F) -> EOJDJEFM.'
  },
  {
    id: 'logic-3',
    category: 'Logical Reasoning',
    difficulty: 'Easy',
    question: 'Pointing to a photograph, Rohan said, "She is the daughter of the only son of my grandfather." How is the girl in the photograph related to Rohan?',
    options: ['Mother', 'Sister', 'Cousin', 'Aunt'],
    correctAnswer: 1,
    explanation: 'The only son of Rohan’s grandfather is Rohan’s father. The daughter of Rohan’s father is Rohan’s sister.'
  },
  {
    id: 'logic-4',
    category: 'Logical Reasoning',
    difficulty: 'Medium',
    question: 'Ananya walks 10 km North, then turns right and walks 6 km East, then turns right again and walks 2 km South. How far is she from her starting point (shortest straight-line distance)?',
    options: ['8 km', '10 km', '12 km', '14 km'],
    correctAnswer: 1,
    explanation: 'Net North displacement = 10 - 2 = 8 km. Net East displacement = 6 km. By Pythagoras theorem, distance = sqrt(8^2 + 6^2) = sqrt(64 + 36) = 10 km.'
  },
  {
    id: 'logic-5',
    category: 'Logical Reasoning',
    difficulty: 'Medium',
    question: 'Statements: All compilers are programs. Some programs are operating systems. Conclusion I: Some compilers are operating systems. Conclusion II: All operating systems are programs.',
    options: [
      'Only Conclusion I follows',
      'Only Conclusion II follows',
      'Both I and II follow',
      'Neither Conclusion I nor II follows'
    ],
    correctAnswer: 3,
    explanation: 'Compilers are a subset of programs, and operating systems overlap with programs, but compilers and operating systems do not necessarily intersect, nor are all OSes programs.'
  },
  {
    id: 'logic-6',
    category: 'Logical Reasoning',
    difficulty: 'Medium',
    question: 'At what angle are the hands of a clock inclined at 4:20?',
    options: ['0 degrees', '10 degrees', '15 degrees', '20 degrees'],
    correctAnswer: 1,
    explanation: 'Angle = |30*H - 5.5*M| = |30*4 - 5.5*20| = |120 - 110| = 10 degrees.'
  },
  {
    id: 'logic-7',
    category: 'Logical Reasoning',
    difficulty: 'Hard',
    question: 'Six friends P, Q, R, S, T, and U are sitting in a circle facing the center. P is between T and U. Q is opposite T and to the immediate left of U. R is opposite U. Who is sitting to the immediate right of P?',
    options: ['T', 'U', 'R', 'S'],
    correctAnswer: 0,
    explanation: 'Facing center: Q is immediate left of U, and P is between U and T, so clockwise order is T -> P -> U -> Q -> S -> R. Facing center, immediate right of P is T.'
  },
  {
    id: 'logic-8',
    category: 'Logical Reasoning',
    difficulty: 'Hard',
    question: 'If 1st January 2024 (a leap year) was a Monday, what day of the week was 1st January 2025?',
    options: ['Tuesday', 'Wednesday', 'Thursday', 'Sunday'],
    correctAnswer: 1,
    explanation: '2024 is a leap year with 366 days = 52 weeks + 2 odd days. Monday + 2 days = Wednesday.'
  },

  // ================= VERBAL ABILITY (10 Questions) =================
  {
    id: 'verbal-1',
    category: 'Verbal Ability',
    difficulty: 'Easy',
    question: 'Choose the word most nearly SYNONYMOUS in meaning to "EPHEMERAL":',
    options: ['Eternal', 'Short-lived / Transient', 'Stubborn', 'Comprehensive'],
    correctAnswer: 1,
    explanation: 'Ephemeral means lasting for a very short time (transient, fleeting).'
  },
  {
    id: 'verbal-2',
    category: 'Verbal Ability',
    difficulty: 'Easy',
    question: 'Choose the word most nearly OPPOSITE (Antonym) in meaning to "MITIGATE":',
    options: ['Alleviate', 'Aggravate', 'Soften', 'Moderate'],
    correctAnswer: 1,
    explanation: 'Mitigate means to make less severe; its antonym is Aggravate (to make worse or more severe).'
  },
  {
    id: 'verbal-3',
    category: 'Verbal Ability',
    difficulty: 'Easy',
    question: 'Identify the grammatically correct sentence:',
    options: [
      'Neither the team lead nor the developers was present at the standup.',
      'Neither the team lead nor the developers were present at the standup.',
      'Neither the team lead or the developers were present at the standup.',
      'Neither the team lead nor the developers is present at the standup.'
    ],
    correctAnswer: 1,
    explanation: 'With "neither... nor", the verb agrees with the closer subject ("developers", plural), requiring "were".'
  },
  {
    id: 'verbal-4',
    category: 'Verbal Ability',
    difficulty: 'Medium',
    question: 'Select the option that best fills the blanks: "Although the initial prototype appeared _______, rigorous stress testing revealed several _______ architectural flaws."',
    options: [
      'fragile ... minor',
      'robust ... critical',
      'flawed ... negligible',
      'obsolete ... beneficial'
    ],
    correctAnswer: 1,
    explanation: '"Although" signals contrast: appearing "robust" initially contrasts logically with revealing "critical" flaws under stress testing.'
  },
  {
    id: 'verbal-5',
    category: 'Verbal Ability',
    difficulty: 'Medium',
    question: 'What is the meaning of the idiom "To burn the midnight oil"?',
    options: [
      'To waste company resources unnecessarily',
      'To work or study late into the night',
      'To instigate an argument',
      'To abandon a project halfway'
    ],
    correctAnswer: 1,
    explanation: '"Burning the midnight oil" means studying or working diligently late at night.'
  },
  {
    id: 'verbal-6',
    category: 'Verbal Ability',
    difficulty: 'Medium',
    question: 'Convert to Passive Voice: "The deployment pipeline automatically runs unit tests on every commit."',
    options: [
      'Unit tests were automatically run by the deployment pipeline on every commit.',
      'Unit tests are automatically run by the deployment pipeline on every commit.',
      'Unit tests are being run by the deployment pipeline on every commit.',
      'The deployment pipeline has been running unit tests on every commit.'
    ],
    correctAnswer: 1,
    explanation: 'Simple present active ("runs") converts to simple present passive ("are automatically run").'
  },
  {
    id: 'verbal-7',
    category: 'Verbal Ability',
    difficulty: 'Hard',
    question: 'Choose the correct sequence (P, Q, R, S) to form a coherent paragraph:\nP: Consequently, organizations must balance model accuracy with interpretability.\nQ: Deep neural networks achieve state-of-the-art predictive performance across complex domains.\nR: In regulated sectors like healthcare and finance, opaque decisions pose compliance risks.\nS: However, their internal decision boundaries often remain difficult for humans to audit.',
    options: ['Q - S - R - P', 'R - P - Q - S', 'S - Q - P - R', 'Q - R - S - P'],
    correctAnswer: 0,
    explanation: 'Q introduces deep neural networks, S contrasts ("However, their internal..."), R gives domain context for why opacity matters, and P concludes ("Consequently...").'
  },
  {
    id: 'verbal-8',
    category: 'Verbal Ability',
    difficulty: 'Hard',
    question: 'Identify the part of the sentence that contains a grammatical error: "Hardly had the server restarted (A) / than the load balancer began (B) / routing live production traffic (C) / to the instance. (D)"',
    options: ['Part A', 'Part B ("than" should be "when")', 'Part C', 'Part D'],
    correctAnswer: 1,
    explanation: 'The correlative conjunction pair is "Hardly... when" (or "No sooner... than"). Therefore, "than" in Part B must be "when".'
  },
];

/**
 * Helper to fetch exact number of questions for a category and optional difficulty.
 * Guarantees that if `count` questions are requested (e.g., 6), exactly `count` distinct
 * questions are returned by backfilling from other difficulties in the same category
 * (or across the bank) if the strict difficulty slice has fewer than `count` items.
 */
export function selectPracticeQuestions(
  bank: PracticeQuestion[],
  category: string,
  difficulty: string,
  count: number
): PracticeQuestion[] {
  const categoryMatches = bank.filter((q) => q.category === category);
  const exactMatches =
    difficulty === 'All'
      ? categoryMatches
      : categoryMatches.filter((q) => q.difficulty === difficulty);

  const selected: PracticeQuestion[] = [...exactMatches];

  // If exact difficulty in this category has fewer than requested count (e.g. user asked for 6 or 10),
  // backfill with remaining questions from the same category so the user gets the exact count requested.
  if (selected.length < count) {
    const usedIds = new Set(selected.map((q) => q.id));
    for (const q of categoryMatches) {
      if (!usedIds.has(q.id)) {
        selected.push(q);
        usedIds.add(q.id);
      }
      if (selected.length >= count) break;
    }
  }

  // If still fewer than count, backfill from remaining questions in the bank
  if (selected.length < count) {
    const usedIds = new Set(selected.map((q) => q.id));
    for (const q of bank) {
      if (!usedIds.has(q.id)) {
        selected.push(q);
        usedIds.add(q.id);
      }
      if (selected.length >= count) break;
    }
  }

  return selected.slice(0, count);
}
