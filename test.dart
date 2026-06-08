void main() {
  Map<String, dynamic> json = {
    'benefits': [['Health']],
  };
  try {
    List<String>.from(json['benefits']);
  } catch (e) {
    print('benefits error: \');
  }

  json = {
    'description': ['A list instead of string'],
  };
  try {
    print(json['description']?.toString() ?? '');
  } catch (e) {
    print('desc error: \');
  }

}
